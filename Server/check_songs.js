const mongoose = require('mongoose');
const Song = require('./models/Song');
require('dotenv').config();

const checkSongs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const song = await Song.findOne();
    console.log('Sample Song Data:', JSON.stringify(song, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

checkSongs();
