const Sekhra = require('../sekhra');
const Coursier = require('../../user/coursier');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');
const Route = require('../route');
const getRoute = require('../../../web/api/mapQuest/route');
const formatShapePoints = require('../helpers/formatShapePoints');
const AppError = require('../../../config/errorHandling');
const sendResponse = require('../../../helpers/errorResponse');

module.exports = acceptSekhra = async (req, res) => {
    const { sekhraId } = req.body;
    const { user } = req;
    try {
        const sekhra = await Sekhra.findById(sekhraId);
        if (!sekhra) {
            const { code, name } = HTTP.NOT_FOUND;
            throw new AppError(
                name,
                code,
                `sekhra with id:${sekhraId} was not found`
            );
        }
        sekhra.coursier = user;
        const [fromLat, fromLong] = sekhra.from;
        const [toLat, toLong] = sekhra.to;
        let route = new Route();
        const routes = await routeSimpleSekhra(
            user.location.coordinates,
            [fromLat, fromLong],
            [toLat, toLong]
        );
        route.waypoints = routes.shapePoints;
        route.formattedTime = routes.formattedTime;
        route.distance = routes.distance;
        await route.save();
        sekhra.route = route;
        await sekhra.save();
        await Coursier.findByIdAndUpdate(
            user._id,
            { $push: { "currentSekhras": sekhra } }
        );
    } catch (error) {
        sendResponse(error, res);
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