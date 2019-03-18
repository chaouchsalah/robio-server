const { 
    addSekhra,
    listSekhras,
    changeSekhraStatus,
    getSekhra
} = require('../actions/sekhra');
const acceptSekhra = require('../actions/acceptSekhra');
const passport = require('passport');

module.exports = (app) => {
    app.post(
        '/sekhras',
        passport.authenticate('jwt', { session: false }),
        addSekhra
    );
    app.get(
        '/sekhras',
        passport.authenticate('jwt', { session: false }),
        listSekhras
    );
    app.patch(
        '/sekhras/:id',
        passport.authenticate('jwt',{ session: false }),
        changeSekhraStatus
    );
    app.get(
        '/sekhras/:id',
        passport.authenticate('jwt',{ session: false }),
        getSekhra
    );
    app.post('/acceptSekhra', acceptSekhra);
};