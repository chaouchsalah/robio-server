const { updateStatus, actifCoursiers, getCoursier } = require('../actions/coursier');
const { rateCoursier, getCustomer } = require('../actions/customer');

module.exports = (app) => {
    app.post('/rate', rateCoursier);
    app.get('/customers/:id', getCustomer);
    app.patch('/status', updateStatus);
    app.get('/actifCoursiers', actifCoursiers);
    app.get('/coursiers/:id', getCoursier);
};