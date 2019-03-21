const getRoute = require('../../../web/api/mapQuest/route');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');
const Sekhra = require('../sekhra');
const Coursier = require('../../user/coursier');
const compareTime = require('../helpers/compareTime');

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
            },
            from
        });
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
    let users = [];
    // Retrieve the _id of the users to be notified
    for (let i = 0; i < coursiers.length; i++) {
        const { currentSekhras, _id } = coursiers[i];
        if (currentSekhras.length === 0) {
            users.push(_id);
        } else {
            // If rider has already a sekhra then we notify the customer too
            for (let j = 0; j < currentSekhras.length; j++) {
                const sekhra = currentSekhras[j];
                try {
                    let coursierSekhra = await Sekhra.findById(
                        sekhra._id
                    );
                    const { customer } = coursierSekhra;
                    users.push(_id);
                    users.push(customer._id);
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
// Finds The closest actif coursier
async function findClosestActifCoursier(criteria, from) {
    let coursiers;
    try {
        // First it gets the 10 closest coursiers geometrically
        coursiers = await Coursier.find(criteria).limit(10);
    } catch (error) {
        throw error;
    }
    if (coursiers.length <= 5) {
        return coursiers;
    }
    let ETAcoursiers = [];
    // Gets the ETA of all the 10 riders
    for (let i = 0; i < coursiers.length; i++) {
        const to = coursiers[i].location.coordinates;
        const { formattedTime } = await getRoute(from, to);
        ETAcoursiers.push(formattedTime);
    }
    // Pick the 5 riders with the lowest ETA
    ETAcoursiers.sort(compareTime);
    return ETAcoursiers.slice(0, 5);
}