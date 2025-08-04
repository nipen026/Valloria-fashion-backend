const passport = require('passport');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV == 'local' ? process.env.GOOGLE_CALLBACK : process.env.GOOGLE_CALLBACK_LIVE,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;

        // First, check if user with email exists
        let user = await User.findOne({ where: { email } });

        if (user) {
          // If user exists but doesn't have googleId yet, link it
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        } else {
          // If user doesn't exist, create new
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            role: 'user',
          });
        }

        return done(null, user);
      } catch (err) {
        console.error('Error in GoogleStrategy:', err);
        return done(err, null);
      }
    }
  )
);


// Required for session-based auth (can be kept even if you're not using sessions)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
