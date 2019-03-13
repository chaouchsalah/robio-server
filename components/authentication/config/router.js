const passport = require('passport');
const HTTP = require('../../../constants/statusCode');
const { sign } = require('jsonwebtoken');
require('../passport');

signToken = user => {
    return sign({
      iss: 'CodeWorkr',
      sub: user.id,
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 1)
    }, process.env.JWT_SECRET);
  }

module.exports = (app) => {
    app.get('/auth/:user', (req, res, next) => {
        process.env.USER_TYPE = req.params.user;
        next();
    }, passport.authenticate('facebook', {session: false}),
        async (req, res) => {
            const token = signToken(req.user);
            res.status(HTTP.SUCCESS).json({ token });
        }
    );
    app.get('/auth/facebook/callback',
    passport.authenticate('facebook'), (req, res) => {
        res.redirect(`http://localhost:3000/${req.user.userType}/profile?id=${req.user._id}`);
    });

    app.get('/logout', (req, res) => {
        req.logout();
        process.env.USER_TYPE = null;
        res.status(200).send({});
    });
};