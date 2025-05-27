// external imports
const bcrypt = require("bcrypt");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require('dotenv').config();
// internal imports
const User = require("../models/People");
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/login/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
            console.log("Google Profile:", profile); 
          let user = await User.findOne({ googleId: profile.id });
  
          if (!user) {
            const hashedPassword = await bcrypt.hash(profile.id, 10);
            user = new User({
              googleId: profile.id,
              displayName: profile.displayName,
              email: profile.emails[0].value,
              password: hashedPassword,
            });
  
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  
  // Serialize user into session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
