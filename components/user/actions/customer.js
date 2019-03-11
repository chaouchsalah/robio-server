const Rating = require('../rating');
const Customer = require('../customer');
const Coursier = require('../coursier');
const logger = require('../../../config/logger');
const HTTP = require('../../../config/statusCode');

const rateCoursier = async (req, res) => {
    const rating = new Rating();
    const customer = await Customer.findById(req.user.id, (err, customer) => {
        if(err) {
            res.status(HTTP.NOT_FOUND).send({error: err});
        }
        return customer;
    });
    rating.customer = customer;
    const coursier = await Coursier.findById(req.body.coursier, (err, coursier) => {
        if(err) {
            res.status(HTTP.NOT_FOUND).send({
                error: err
            });
        }
        return coursier;
    });
    rating.coursier = coursier;
    rating.rating = req.body.rating;
    await rating.save((err) => {
        if (err) {
            logger.error(err);
            res.status(HTTP.SERVER_ERROR).send({
                error: err
            });
        }
    });
    res.status(HTTP.SUCCESS)
};

const getCustomer = (req, res) => {
    Customer.findById(req.params.id, (error, customer) => {
        console.log(customer);
        if(error) {
            res.status(HTTP.NOT_FOUND).send({error});
        }
        res.status(HTTP.SUCCESS).send({customer});
    });
}

module.exports = {
    rateCoursier,
    getCustomer
}