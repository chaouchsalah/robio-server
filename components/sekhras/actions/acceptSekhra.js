const Sekhra = require('../sekhra');
const Coursier = require('../../user/coursier');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');
const Route = require('../route');
const getRoute = require('../../../web/api/mapQuest/route');
const formatShapePoints = require('../helpers/formatShapePoints');

module.exports = acceptSekhra = async (req, res) => {
    const { sekhraId } = req.body;
    const { user } = req;
    let sekhra;
    try {
        sekhra = await Sekhra.findById(sekhraId);
    } catch (error) {
        return res.status(HTTP.NOT_FOUND).send({ error });
    }
    sekhra.coursier = user;
    const [fromLat, fromLong] = sekhra.from;
    const [toLat, toLong] = sekhra.to;
    let route = new Route();
    try {
        const routes = await routeSimpleSekhra(
            user.location.coordinates,
            [fromLat, fromLong],
            [toLat, toLong]
        );
        route.waypoints = routes.shapePoints;
        route.formattedTime = routes.formattedTime;
        route.distance = routes.distance;
        await route.save();
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
    sekhra.route = route;
    try {
        await sekhra.save();
        await Coursier.findByIdAndUpdate(
            user._id,
            { $push: { "currentSekhras": sekhra } }
        );
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
    return res.status(HTTP.SUCCESS).send();
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
        throw error;
    }
    return formatShapePoints(routeToSekhra, route);
}