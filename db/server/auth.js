const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
require("dotenv").config();
const db = require("../connection");
const { createUser, fetchUsername } = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const account = profile._json;
      const {
        sub: username,
        name: display_name,
        picture: avatar_url,
      } = account;

      const user = {
        username,
        display_name,
        avatar_url,
      };

      fetchUsername(user.username)
        .then((currentUser) => {
          currentUser;
          // checking if response contains a user obj from our db
          if (currentUser.length) {
            done(null, currentUser[0]);
          } else {
            // if not, create a new user in the database
            createUser(user);
            console.log(user);
            fetchUsername(user.username)
              .then((newUser) => {
                newUser;
                done(null, newUser[0]);
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => {
          console.log(err);
          done(err, null);
        });
    }
  )
);


passport.serializeUser((user, done) => {
  // loads into req.session.passport.user
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // loads into req.user
  done(null, user);
});
