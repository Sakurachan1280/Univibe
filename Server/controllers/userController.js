const userService = require('../services/userService');
const { profileUpdateSchema } = require('../validations/authValidation');
const User = require('../models/User');

const updateProfile = async (req, res) => {
  try {
    console.log('>> [UPDATE PROFILE] Request received for user:', req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.files && req.files.avatar) {
      console.log('>> [AVATAR UPLOAD]', req.files.avatar[0]);
      user.profile.avatar_url = req.files.avatar[0].path || req.files.avatar[0].secure_url || req.files.avatar[0].url;
    }
    if (req.files && req.files.cover) {
      console.log('>> [COVER UPLOAD]', req.files.cover[0]);
      user.profile.cover_url = req.files.cover[0].path || req.files.cover[0].secure_url || req.files.cover[0].url;
    }

    const { display_name, bio, dob } = req.body;
    if (display_name) user.profile.display_name = display_name;
    if (bio) user.profile.bio = bio;
    if (dob) user.profile.dob = new Date(dob);

    if (req.body.genres_interest) {
      let genres = req.body.genres_interest;
      if (typeof genres === 'string') {
        try { genres = JSON.parse(genres); } catch (e) { genres = [genres]; }
      }
      user.profile.genres_interest = genres;
    }
    if (req.body.social_instagram) user.profile.social_links.instagram = req.body.social_instagram;
    if (req.body.social_spotify) user.profile.social_links.spotify = req.body.social_spotify;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  console.log('>> [GET ME] Request received for user:', req.user.id);
  res.json(req.user);
}

module.exports = { updateProfile, getMe };