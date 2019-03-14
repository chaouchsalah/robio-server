const HTTP = require('../../../constants/statusCode');
const { sign } = require('jsonwebtoken');
const types = require('../../user/constants/types');
const logger = require('../../../config/logger');
const Customer = require('../../user/customer');
const Coursier = require('../../user/coursier');
require('../passport');


module.exports = (app) => {
    app.post('/auth', async (req, res) => {
        let User = req.body.userType === types.CUSTOMER ? Customer : Coursier;
        try {
            console.log(req.body);
            let user = await User.findOne({ facebookId: req.body.id });
            if (!user) {
                user = new User();
                user.facebookId = req.body.id;
                user.displayName = req.body.name;
                await user.save();
            }
            const payload = {id: user.id};
            const token = sign(payload, process.env.JWT_SECRET);
            return res.status(HTTP.SUCCESS).send({token});
        } catch (error) {
            logger.error(error);
            return res.status(HTTP.SERVER_ERROR).send({error});
        }
    });
};