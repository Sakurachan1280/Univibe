const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validations/authValidation');

const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    await authService.resetPassword(email, otp, newPassword);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const googleAuthCallback = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (!req.user) {
    return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
  const token = authService.generateToken(req.user._id);
  res.redirect(`${frontendUrl}/login-success?token=${token}`);
};

const googleMobileAuth = async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code) return res.status(400).json({ message: 'code is required' });
    if (!redirectUri) return res.status(400).json({ message: 'redirectUri is required' });
    const result = await authService.googleMobileLogin(code, redirectUri);
    res.json(result);
  } catch (err) {
    console.error('Google Mobile Auth Error:', err.message);
    res.status(401).json({ message: 'Google authentication failed: ' + err.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, googleAuthCallback, googleMobileAuth };
