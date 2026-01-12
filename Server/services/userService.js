const User = require('../models/User');

const updateProfile = async (userId, updateData) => {
  const updateFields = {};
  for (const key in updateData) {
    updateFields[`profile.${key}`] = updateData[key];
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-password');

  return user;
};

const setupInitialProfile = async (userId, genres, artists) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { 
      $set: { 
        'profile.genres_interest': genres 
      } 
    },
    { new: true }
  );
  return user;
};

module.exports = { updateProfile, setupInitialProfile };