const { 
    addSekhra,
    listSekhras,
    changeSekhraStatus
} = require('../actions/sekhra');

module.exports = (app) => {
    app.post('/sekhras', addSekhra);
    app.get('/sekhras', listSekhras);
    app.patch('/sekhras/:id', changeSekhraStatus);
};