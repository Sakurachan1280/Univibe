const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp_code: { type: String, required: true },
  type: { type: String, enum: ['reset_password', 'verify_email'], required: true },
  expires_at: { type: Date, required: true }
});

verificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Verification', verificationSchema);