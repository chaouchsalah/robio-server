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
    for (let i = 0; i < coursiers.length; i++) {
        if (coursiers[i].currentSekhras.length === 0) {
            users.push(coursiers[i]._id);
        } else {
            for (let j = 0; j < coursiers[i].currentSekhras.length; j++) {
                const sekhra = coursiers[i].currentSekhras[j];
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
async function findClosestActifCoursier(criteria, from) {
    let coursiers;
    try {
        coursiers = await Coursier.find(criteria).limit(10);
    } catch (error) {
        throw error;
    }
    if(coursiers.length <= 5) {
        return coursiers;
    }
    let ETAcoursiers = [];
    for(let i=0;i<coursiers.length;i++) {
        const to = coursiers[i].location.coordinates;
        const {formattedTime} = await getRoute(from, to);
        ETAcoursiers.push(formattedTime);
    }
    ETAcoursiers.sort(compareTime);
    return ETAcoursiers.slice(0,5);
}
