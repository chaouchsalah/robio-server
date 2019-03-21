const HTTP = require('../../../constants/statusCode');
const { sign } = require('jsonwebtoken');
const types = require('../constants/types');
const logger = require('../../../config/logger');
const Customer = require('../customer');
const Coursier = require('../coursier');


module.exports = findOrCreateUser = async (req, res) => {
    const { userType, id, name } = req.body;
    let User = userType === types.CUSTOMER ? Customer : Coursier;
    try {
        let user = await User.findOne({ facebookId: id });
        if (!user) {
            user = new User();
            user.facebookId = id;
            user.displayName = name;
            if (userType === types.COURSIER) {
                const { lat, long } = req.body.location;
                user.location = {
                    type: 'Point',
                    coordinates: [
                        lat,
                        long
                    ]
                };
            }
            await user.save();
        }
        const payload = { id: user.id };
        const token = sign(payload, process.env.JWT_SECRET);
        return res.status(HTTP.SUCCESS).send({ token });
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
};