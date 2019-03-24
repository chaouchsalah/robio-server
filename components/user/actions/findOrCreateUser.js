const HTTP = require('../../../constants/statusCode');
const { sign } = require('jsonwebtoken');
const types = require('../constants/types');
const Customer = require('../customer');
const Coursier = require('../coursier');
const axios = require('axios');
const AppError = require('../../../config/errorHandling');
const sendResponse = require('../../../helpers/errorResponse');

module.exports = findOrCreateUser = async (req, res) => {
    try {
        const { userType, userToken } = req.body;
        const appLink = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&grant_type=client_credentials`;
        let response = await axios.get(appLink);
        const { access_token } = response.data;
        const link = `https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${access_token}`;
        response = await axios.get(link);
        const { user_id } = response.data.data;
        if (!user_id) {
            const { code, name } = HTTP.BAD_REQUEST;
            throw new AppError(
                name,
                code,
                'The user token isn\'t right'
            );
        }
        const fields = ['id', 'name', 'email'].join(',');
        const infos = `https://graph.facebook.com/${user_id}?fields=${fields}&access_token=${access_token}`;
        response = await axios.get(infos);
        const { id, name } = response.data;
        let User = userType === types.CUSTOMER ? Customer : Coursier;
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
        const { code } = HTTP.SUCCESS;
        return res.status(code).send({ token });
    } catch (error) {
        return sendResponse(error, res);
    }
}; 