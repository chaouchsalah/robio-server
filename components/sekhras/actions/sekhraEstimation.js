const getRoute = require('../../../web/api/mapQuest/route');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');
const statusTypes = require('../constants/status');
const Sekhra = require('../sekhra');
const Customer = require('../../user/customer');
const Coursier = require('../../user/coursier');
const userTypes = require('../../user/constants/types');
const getClosest = require('../helpers/closestCoursier');
const formatShapePoints = require('../helpers/formatShapePoints');
const Notification = require('../../notification/notif');

module.exports = estimateSekhra = async (sekhra, io) => {
    const { from, to } = sekhra;
    const [fromLat, fromLong] = from;
    let coursiers;
    try {
        // Find the 5 closest actif coursiers
        coursiers = await findClosestActifCoursier({
            actif: "true",
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [fromLat, fromLong]
                    }
                }
            }
        });
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
    let users = [];
    for (let i = 0; i < coursiers.length; i++) {
        if (coursiers[i].currentSekhras.length === 0) {
            users.push(coursiers[i]._id);
        } else {
            for (let i = 0; i < coursiers[i].currentSekhras.length; i++) {
                const sekhra = coursiers[i].currentSekhras[i];
                try {
                    let coursierSekhra = await Sekhra.findById(
                        sekhra._id
                    );
                    users.push(coursierSekhra.customer._id);
                } catch (error) {
                    logger.error(error);
                    return res.status(HTTP.SERVER_ERROR).send({ error });
                }
            }
        }
    }
    io.sockets.emit('notification', {
        users,
        sekhra: sekhra._id
    });
};

// TODO: Find the coursier who is going to finish first and closest
async function findClosestActifCoursier(criteria) {
    let coursierId;
    let coursiers;
    try {
        coursierId = await Coursier.find(criteria, { limit: 5 });
        coursiers = await Coursier.find({ _id: coursierId });
    } catch (error) {
        throw error;
    }
    return coursiers;
}