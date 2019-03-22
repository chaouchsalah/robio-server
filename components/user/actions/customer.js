const Rating = require('../rating');
const Customer = require('../customer');
const Coursier = require('../coursier');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');
const AppError = require('../../../config/errorHandling');
const sendResponse = require('../../../helpers/errorResponse');

const rateCoursier = async (req, res) => {
    try {
        const rating = new Rating();
        const customer = req.user;
        rating.customer = customer;
        const coursier = await Coursier.findById(req.body.coursier);
        if (!coursier) {
            const { code, name } = HTTP.NOT_FOUND;
            throw new AppError(
                name,
                code,
                `coursier with id:${id} was not found`
            );
        }
        rating.coursier = coursier;
        rating.rating = req.body.rating;
        await rating.save();
    } catch (error) {
        sendResponse(error, res);
    }
    return res.status(HTTP.SUCCESS).send({coursier});
};

const getCustomer = async (req, res) => {
    try {
        const customer = Customer.findById(req.params.id);
        return res.status(HTTP.SUCCESS).send({ customer });
    } catch (error) {
        return res.status(HTTP.NOT_FOUND).send({ error });
    }
}

const updateCustomer = async (req, res) => {
    try {
        Customer.updateOne(req.params.id, (req.body.costumer));
        res.status(HTTP.SUCCESS).send({ customer });
    } catch (error) {
        res.status(HTTP.NOT_FOUND).send({ error });
    }

}

module.exports = {
    rateCoursier,
    getCustomer,
    updateCustomer
}