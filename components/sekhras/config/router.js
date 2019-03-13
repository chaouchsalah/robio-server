const { 
    addSekhra,
    listSekhras,
    changeSekhraStatus
} = require('../actions/sekhra');
const estimateSekhra = require('../actions/sekhraEstimation');

module.exports = (app) => {
    app.post('/sekhras', addSekhra);
    app.get('/sekhras', listSekhras);
    app.patch('/sekhras/:id', changeSekhraStatus);
    app.post('/sekhrasEstimation', estimateSekhra);
};