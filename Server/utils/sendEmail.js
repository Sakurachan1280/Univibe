const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Spotichat Support" <${process.env.EMAIL_HOST_USER}>`, 
    to: options.email, 
    subject: options.subject, 
    text: options.message, 
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;