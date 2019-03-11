const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Customer = require('../user/customer');
const Coursier = require('../user/coursier');
const types = require('../user/types');
const logger = require('../../config/logger');

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    findOrCreateUser(profile, done, accessToken);
  }
));

async function findOrCreateUser(profile, done, accessToken) {
  let User = process.env.USER_TYPE === types.CUSTOMER ? Customer : Coursier;
  let user = await User.findOne({ facebookId: profile.id }, (err, user) => {
    if(err) return;
    done(null,user);
  });
  if(!user) {
    user = new User(profile);
    user.facebookId = profile.id;
    user.token = accessToken;
    user.photo = profile.photos[0].value;
    user.save((err) => {
      if(err) {
        logger.error(err);
        done(err);
      }
      done(null,user);
    })
  }
}

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.JWT_SECRET
  },  async (payload, done) => {
    done(null, payload);
  })
);