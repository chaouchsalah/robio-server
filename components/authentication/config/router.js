const findOrCreateUser = require('../../user/actions/findOrCreateUser');
require('../passport');


module.exports = (app) => {
    app.post('/auth', findOrCreateUser);
};