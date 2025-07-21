const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK,
}, async (accessToken, refreshToken, profile, done) => {
  const [user] = await User.findOrCreate({
    where: { googleId: profile.id },
    defaults: {
      name: profile.displayName,
      email: profile.emails[0].value,
      role: 'user'
    }
  });
  done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});
