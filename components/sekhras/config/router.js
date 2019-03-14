const { 
    addSekhra,
    listSekhras,
    changeSekhraStatus
} = require('../actions/sekhra');
const estimateSekhra = require('../actions/sekhraEstimation');
const passport = require('passport');

module.exports = (app) => {
    app.post('/sekhras', passport.authenticate('jwt', { session: false }), addSekhra);
    app.get('/sekhras', passport.authenticate('jwt', { session: false }), listSekhras);
    app.patch('/sekhras/:id', passport.authenticate('jwt', { session: false }), changeSekhraStatus);
    app.post('/sekhrasEstimation', passport.authenticate('jwt', { session: false }), estimateSekhra);
};