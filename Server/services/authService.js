const User = require('../models/User');
const Verification = require('../models/Verification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const googleOAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'oiuytrewjhgfdsiuytremnbvcxuytrebvcxfdspoiuytrewlkjhgfdsaiuytrew', {
    expiresIn: '30d',
  });
};

const register = async (data) => {
  const userExists = await User.findOne({
    $or: [{ email: data.email }, { username: data.username }]
  });
  if (userExists) throw new Error('Email or Username already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  const user = await User.create({
    username: data.username,
    email: data.email,
    password: hashedPassword,
    profile: {
      display_name: data.display_name || data.username
    }
  });

  return {
    _id: user._id,
    token: generateToken(user._id)
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');

  if (user.auth_provider === 'local') {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');
  }

  user.status.is_online = true;
  user.status.last_active = Date.now();
  await user.save();

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    profile: user.profile,
    token: generateToken(user._id)
  };
};

const forgotPassword = async (email, username) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) throw new Error('Không tìm thấy tài khoản với email này');
  if (user.username.toLowerCase().trim() !== username.toLowerCase().trim()) throw new Error('Tên đăng nhập không khớp với email');
  return { message: 'Identity verified' };
};

const resetPassword = async (email, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Không tìm thấy tài khoản');

  // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
  // (chỉ kiểm tra nếu user có password, tài khoản Google có thể không có)
  if (user.password) {
    let isSame = false;
    try {
      isSame = await bcrypt.compare(newPassword, user.password);
    } catch (_) {
      isSame = false;
    }

    if (isSame) {
      // Không đổi mật khẩu, nhưng trả về token để client có thể cho vào app
      return {
        samePassword: true,
        token: generateToken(user._id),
        role: user.role,
      };
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await User.findOneAndUpdate({ email }, { password: hashedPassword });

  return {
    samePassword: false,
    message: 'Password updated successfully',
    token: generateToken(user._id),
    role: user.role,
  };
};

const googleMobileLogin = async (code, redirectUri, codeVerifier) => {
  // 1) Exchange authorization code → lấy id_token từ Google
  googleOAuth2Client.redirectUri = redirectUri;
  const tokenRequest = { code, redirect_uri: redirectUri };
  // PKCE: nếu client gửi code_verifier thì thêm vào request
  if (codeVerifier) tokenRequest.codeVerifier = codeVerifier;
  const { tokens } = await googleOAuth2Client.getToken(tokenRequest);

  const idToken = tokens.id_token;
  if (!idToken) throw new Error('Không nhận được id_token từ Google');

  // 2) Verify id_token
  const ticket = await googleOAuth2Client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Invalid Google token');

  const { email, name, picture, sub: googleId } = payload;

  // 3) Kiểm tra ADMIN_EMAILS
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
  const isAdmin = adminEmails.includes(email);

  // 4) Tìm hoặc tạo user
  let user = await User.findOne({ email });

  if (user) {
    if (user.auth_provider === 'local') {
      user.auth_provider = 'google';
    }
    if (isAdmin && user.role !== 'admin') user.role = 'admin';
    user.status.is_online = true;
    user.status.last_active = new Date();
    await user.save();
  } else {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const safeUsername = (name || 'user').replace(/\s/g, '').toLowerCase() + randomSuffix;

    user = await User.create({
      username: safeUsername,
      email,
      auth_provider: 'google',
      role: isAdmin ? 'admin' : 'user',
      profile: {
        display_name: name || safeUsername,
        avatar_url: picture || '',
      },
      status: { is_online: true, last_active: new Date() },
    });
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    profile: user.profile,
    token: generateToken(user._id),
  };
};

module.exports = { register, login, forgotPassword, resetPassword, generateToken, googleMobileLogin };
