const Sekhra = require('../sekhra');
const Coursier = require('../../user/coursier');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');
const Route = require('../route');
const getRoute = require('../../../web/api/mapQuest/route');
const formatShapePoints = require('../helpers/formatShapePoints');

module.exports = acceptSekhra = async (req, res) => {
    const { sekhraId, user } = req.body;
    let sekhra, coursier;
    try {
        sekhra = await Sekhra.findById(sekhraId);
        coursier = await Coursier.findById(user._id);
    } catch (error) {
        return res.status(HTTP.NOT_FOUND).send({ error });
    }
    sekhra.coursier = coursier;
    sekhra.activated = true;
    const [fromLat, fromLong] = sekhra.from;
    const [toLat, toLong] = sekhra.to;
    let route = new Route();
    try {
        const routes = await routeSimpleSekhra(
            coursier.location.coordinates,
            [fromLat, fromLong],
            [toLat, toLong]
        );
        route.waypoints = routes.shapePoints;
        route.formattedTime = routes.formattedTime;
        route.distance = routes.distance;
        route.save();
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
    sekhra.route = route;
    try {
        sekhra.save();
        Coursier.findByIdAndUpdate(
            coursier._id,
            { $push: { "currentSekhras": sekhra } }
        );
    } catch (error) {
        logger.error(error);
        res.status(HTTP.SERVER_ERROR).send({ error });
    }
    res.status(HTTP.SUCCESS).send();
};

async function routeSimpleSekhra(coursierCoords, fromCoords, toCoords) {
    const [coursierLat, coursierLong] = coursierCoords;
    const [fromLat, fromLong] = fromCoords;
    const [toLat, toLong] = toCoords;
    let routeToSekhra, route;
    try {
        routeToSekhra = await getRoute(
            [coursierLat, coursierLong],
            [fromLat, fromLong]
        );
        route = await getRoute([fromLat, fromLong], [toLat, toLong]);
    } catch (error) {
        return error;
    }
    return formatShapePoints(routeToSekhra, route);
}
