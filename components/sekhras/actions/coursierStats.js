const Sekhra = require('../sekhra');
const calculateDistance = require('../helpers/calculateDistance');
const calculateTime = require('../helpers/calculateTime');
const HTTP = require('../../../constants/statusCode');
const logger = require('../../../')

async function getDailyStats(req, res) {
    return getStats(req, res, 1);
}

async function getWeeklyStats(req, res) {
    return getStats(req, res, 7);
}

async function getMonthlyStats(req, res) {
    return getStats(req, res, 30);
}

async function getYearlyStats(req, res) {
    return getStats(req, res, 365);
}

async function getStats(req, res, duration) {
    const { _id } = req.user;
    const week = new Date().getTime() - duration * 24 * 60 * 60 * 1000;
    let result;
    try {
        result = await calculateStats(week, _id);
    } catch (error) {
        const { code } = HTTP.SERVER_ERROR;
        logger.error(error);
        return res.status(code).send({ error });
    }
    const { code } = HTTP.SUCCESS;
    return res.status(code).send(result);
}

async function calculateStats(duration, _id) {
    let sekhras;
    try {
        sekhras = await Sekhra.find({
            createdAt: {
                $gt: new Date(duration)
            },
            coursier: _id
        }).populate('route');
    } catch (error) {
        throw error;
    }
    const number = sekhras.length;
    const distance = calculateDistance(sekhras);
    const time = calculateTime(sekhras);
    return { number, distance, time };
}

module.exports = {
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    getYearlyStats
} 