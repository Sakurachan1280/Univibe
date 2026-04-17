const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    // Làm sạch URI để tránh lỗi "not primary" khi directConnection=true
    const rawURI = process.env.MONGO_URI || '';
    const cleanURI = rawURI.replace(/[&?]directConnection=true/, '');

    const conn = await mongoose.connect(cleanURI, {
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;