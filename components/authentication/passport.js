const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Customer = require('../user/customer');
const Coursier = require('../user/coursier');
const logger = require('../../config/logger');


const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(options, async (payload, next) => {
  try {
    const user = await Customer.findOne({ _id: payload.id }) ||
      await Coursier.findOne({ _id: payload.id });
    if (!user) {
      return next(null, false);
    }
    return next(null, user);
  } catch (error) {
    logger.error(error);
    return next(error, false);
  }
}));