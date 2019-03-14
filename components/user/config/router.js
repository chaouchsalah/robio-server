const { updateStatus, actifCoursiers, getCoursier } = require('../actions/coursier');
const { rateCoursier, getCustomer, updateCustomer } = require('../actions/customer');
const passport = require('passport');

module.exports = (app) => {
    // Coursier routes
    app.get('/actifCoursiers', passport.authenticate('jwt', { session: false }), actifCoursiers);
    app.get('/coursiers', passport.authenticate('jwt', { session: false }), getCoursier);
    app.patch('/status', passport.authenticate('jwt', { session: false }), updateStatus);
    // Customer routes
    app.get('/customers', passport.authenticate('jwt', { session: false }), getCustomer);
    app.post('/rate', passport.authenticate('jwt', { session: false }), rateCoursier);
    app.put('/customers/:id', passport.authenticate('jwt', { session: false }), updateCustomer);
};