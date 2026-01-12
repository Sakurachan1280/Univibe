const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(',')
  .map(email => email.trim())
  .filter(email => email);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const displayName = profile.displayName;
      const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
      const isAdmin = ADMIN_EMAILS.includes(email);

      let user = await User.findOne({ email: email });

      if (user) {
        let hasChange = false;
        if (user.auth_provider === 'local') {
          user.auth_provider = 'google';
          hasChange = true;
        }

        if (isAdmin && user.role !== 'admin') {
          user.role = 'admin';
          hasChange = true;
        }

        if (hasChange) await user.save();
        return done(null, user);

      } else {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const safeUsername = displayName.replace(/\s/g, '').toLowerCase() + randomSuffix;

        const newUser = await User.create({
          username: safeUsername,
          email: email,
          auth_provider: 'google',
          role: isAdmin ? 'admin' : 'user',
          profile: {
            display_name: displayName,
            avatar_url: avatar
          },
          status: {
            is_online: true,
            last_active: new Date()
          }
        });
        
        return done(null, newUser);
      }
    } catch (err) {
      console.error("Passport Google Error:", err);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;