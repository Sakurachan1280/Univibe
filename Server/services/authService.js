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

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Verification.deleteMany({ email: email, type: 'reset_password' });

  await Verification.create({
    email: email,
    otp_code: otp,
    type: 'reset_password',
    expires_at: new Date(Date.now() + 5 * 60 * 1000)
  });

  const message = `Mã xác nhận của bạn là: ${otp}`;
  const htmlMessage = `
    <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #1DB954;">Đặt lại mật khẩu</h2>
      <p>Xin chào <strong>${user.profile.display_name || user.username}</strong>,</p>
      <p>Mã OTP của bạn là:</p>
      <h1 style="color: #333; letter-spacing: 5px;">${otp}</h1>
      <p>Mã này sẽ hết hạn sau 5 phút.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Mã xác thực Spoti App',
      message: message,
      html: htmlMessage
    });
  } catch (err) {
    await Verification.deleteMany({ email: email, type: 'reset_password' });
    throw new Error('Không thể gửi email. Vui lòng kiểm tra lại đường truyền.');
  }

  return { message: 'OTP sent to email successfully' };
};

const resetPassword = async (email, otp, newPassword) => {
  const verifyRecord = await Verification.findOne({
    email,
    otp_code: otp,
    type: 'reset_password'
  });

  if (!verifyRecord) throw new Error('Invalid or expired OTP');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await User.findOneAndUpdate({ email }, { password: hashedPassword });

  await Verification.deleteOne({ _id: verifyRecord._id });

  return { message: 'Password updated successfully' };
};

const googleMobileLogin = async (idToken) => {
  // 1) Verify token với Google
  const ticket = await googleOAuth2Client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Invalid Google token');

  const { email, name, picture, sub: googleId } = payload;

  // 2) Kiểm tra ADMIN_EMAILS
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
  const isAdmin = adminEmails.includes(email);

  // 3) Tìm hoặc tạo user
  let user = await User.findOne({ email });

  if (user) {
    // Cập nhật provider nếu cần
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
