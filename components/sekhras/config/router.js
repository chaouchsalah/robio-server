const { 
    addSekhra,
    listSekhras,
    changeSekhraStatus,
    estimateSekhra 
} = require('../actions/sekhra');

module.exports = (app) => {
    app.post('/sekhras', addSekhra);
    app.get('/sekhras', listSekhras);
    app.patch('/sekhras/:id', changeSekhraStatus);
    app.get('/sekhrasEstimation', estimateSekhra);
};