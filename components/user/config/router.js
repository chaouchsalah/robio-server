const { updateStatus, actifCoursiers, getCoursier } = require('../actions/coursier');
const { rateCoursier, getCustomer, updateCustomer } = require('../actions/customer');

module.exports = (app) => {
    // Coursier routes
    app.get('/actifCoursiers', actifCoursiers);
    app.get('/coursiers/:id', getCoursier);
    app.patch('/status', updateStatus);
    // Customer routes
    app.get('/customers/:id', getCustomer);
    app.post('/rate', rateCoursier);
    app.put('/customers/:id', updateCustomer);
};