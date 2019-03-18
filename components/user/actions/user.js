const HTTP = require('../../../constants/statusCode');

const getUser = async (req, res) => {
    return res.status(HTTP.SUCCESS).send({user: req.user});
};

module.exports = {
    getUser
};