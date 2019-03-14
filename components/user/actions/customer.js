const Rating = require('../rating');
const Customer = require('../customer');
const Coursier = require('../coursier');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');

const rateCoursier = async (req, res) => {
    const rating = new Rating();
    let customer, coursier;
    try {
        customer = await Customer.findById(req.user.id);
        rating.customer = customer;
        coursier = await Coursier.findById(req.body.coursier);
    }catch(error) {
        return res.status(HTTP.NOT_FOUND).send({error: err});
    }
    
    rating.coursier = coursier;
    rating.rating = req.body.rating;
    try {
        await rating.save();
    }catch(error){
        logger.error(err);
        return res.status(HTTP.SERVER_ERROR).send({error: err});
    }
    return res.status(HTTP.SUCCESS)
};

const getCustomer = async (req, res) => {
    try {
        return res.status(HTTP.SUCCESS).send({customer: req.user});
    }catch(error) {
        return res.status(HTTP.NOT_FOUND).send({error});
    }
    
}

const updateCustomer = async (req, res) => {
    try {
        Customer.updateOne(req.params.id, (req.body.costumer));
        res.status(HTTP.SUCCESS).send({customer});
    }catch(error) {
        res.status(HTTP.NOT_FOUND).send({error});
    }
    
}

module.exports = {
    rateCoursier,
    getCustomer,
    updateCustomer
}