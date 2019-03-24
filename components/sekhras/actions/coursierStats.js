const Sekhra = require('../sekhra');
const calculateDistance = require('../helpers/calculateDistance');
const calculateTime = require('../helpers/calculateTime');
const HTTP = require('../../../constants/statusCode');
const logger = require('../../../')

async function getDailyStats(req, res) {
    const { _id } = req.user;
    const day = new Date().getTime() - 24 * 60 * 60 * 1000;
    let result;
    try {
        result = await calculateStats(day, _id);
    }catch(error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({error});
    }
    return res.status(HTTP.SUCCESS).send(result);
}

async function getWeeklyStats(req, res) {
    const { _id } = req.user;
    const week = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    let result;
    try {
        result = await calculateStats(week, _id);
    }catch(error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({error});
    }
    return res.status(HTTP.SUCCESS).send(result);
}

async function getMonthlyStats(req, res) {
    const { _id } = req.user;
    const week = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    let result;
    try {
        result = await calculateStats(week, _id);
    }catch(error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({error});
    }
    return res.status(HTTP.SUCCESS).send(result);
}

async function getYearlyStats(req, res) {
    const { _id } = req.user;
    const week = new Date().getTime() - 365 * 24 * 60 * 60 * 1000;
    let result;
    try {
        result = await calculateStats(week, _id);
    }catch(error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({error});
    }
    return res.status(HTTP.SUCCESS).send(result);
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