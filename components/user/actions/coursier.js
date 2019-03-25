const Coursier = require('../coursier');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');

const updateStatus = async (req, res) => {
    try {
        const {_id} = req.user;
        await Coursier.findByIdAndUpdate(_id,{ $set: {actif: !actif} });
    }catch(error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({error});
    }
    return res.status(HTTP.SUCCESS);
};

const actifCoursiers = async (req, res) => {
    try {
        await Coursier.find({actif: true});
    }catch(error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({error});
    }
};

const getCoursier = async (req, res) => {
    try {
        await Coursier.findById(req.params.id);
    }catch(error) {
        logger.error(error);
        res.status(HTTP.NOT_FOUND).send({error});
    }
}
module.exports = {
    updateStatus,
    actifCoursiers,
    getCoursier
}