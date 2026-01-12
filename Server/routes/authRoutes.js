const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login); 
router.post('/forgot-password', authController.forgotPassword); 
router.post('/reset-password', authController.resetPassword); 
// Redirect sang Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// user bấm "Đồng ý"
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/v1/auth/login' }),
  authController.googleAuthCallback
);

module.exports = router;