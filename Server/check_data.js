const mongoose = require('mongoose');
const Song = require('./models/Song');
const User = require('./models/User');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const songs = await Song.countDocuments();
    const users = await User.countDocuments();
    console.log('--- Database Stats ---');
    console.log('Songs:', songs);
    console.log('Users:', users);
    
    if (songs === 0) {
      console.log('WARNING: No songs in database! The app might look empty.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

checkData();
