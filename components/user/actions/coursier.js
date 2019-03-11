const Coursier = require('../coursier');
const logger = require('../../../config/logger');
const HTTP = require('../../../config/statusCode');

const updateStatus = async (req, res) => {
    const { _id, actif } = await Coursier.findById(req.user.id, (error, coursier) => {
        if(error) {
            res.status(HTTP.NOT_FOUND).send({error});
        }
        return coursier;
    });
    await Coursier.findByIdAndUpdate(_id,{ $set: {actif: !actif} }, (error) => {
        if(error) {
            logger.error(error);
            res.status(HTTP.SERVER_ERROR).send({error});
        }
    });
    res.status(HTTP.SUCCESS);
};

const actifCoursiers = (req, res) => {
    Coursier.find({actif: true}, (error, coursiers) => {
        if(error) {
            logger.error(error);
            res.status(HTTP.SERVER_ERROR).send({error});
        }
        res.status(HTTP.SUCCESS).send({coursiers});
    });
};

const getCoursier = (req, res) => {
    Coursier.findById(req.params.id, (error, coursier) => {
        if(error) {
            res.status(HTTP.NOT_FOUND).send({error});
        }
        res.status(HTTP.SUCCESS).send({coursier});
    });
}
module.exports = {
    updateStatus,
    actifCoursiers,
    getCoursier
}