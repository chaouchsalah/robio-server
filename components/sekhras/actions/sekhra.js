const Sekhra = require('../sekhra');
const Customer = require('../../user/customer');
const Coursier = require('../../user/coursier');
const userTypes = require('../../user/constants/types');
const statusTypes = require('../constants/status');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');

const addSekhra = async (req, res) => {
    if (process.env.USER_TYPE === userTypes.COURSIER) {
        return res.status(HTTP.UNAUTHORIZED).send({ error: 'Unauthorized' });
    }
    let customer, coursier;
    try {
        customer = await Customer.findById(req.body.customer._id);
        coursier = await Coursier.findById(req.body.coursier._id);
    } catch (error) {
        return res.status(HTTP.NOT_FOUND).send({ error });
    }

    let sekhra = new Sekhra(req.body.sekhra);
    sekhra.customer = customer;
    sekhra.coursier = coursier;
    try {
        await sekhra.save((error));
        await Coursier.findOneAndUpdate({ _id: coursier._id },
            { $push: { "currentSekhras": sekhra } });
        await Customer.findOneAndUpdate({ _id: customer._id },
            { $push: { "currentSekhras": sekhra } }
        );
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
    return res.status(HTTP.CREATED).send({ sekhra });
};

const listSekhras = async (req, res) => {
    const User = process.env.USER_TYPE === userTypes.CUSTOMER
        ? Customer : Coursier;
    let user;
    try {
        user = await User.findById(req.user.id);
    } catch (error) {
        return res.status(HTTP.NOT_FOUND).send({ error });
    }
    try {
        await Sekhra.find({ $or: [{ coursier: user }, { customer: user }] });
        return res.status(HTTP.SUCCESS).send({ sekhras: sekhras });
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
};

const changeSekhraStatus = async (req, res) => {
    if (process.env.USER_TYPE === userTypes.CUSTOMER) {
        return res.status(HTTP.UNAUTHORIZED).send({ error: 'Unauthorized' });
    }
    let coursier, sekhra;
    try {
        coursier = await Coursier.findById(req.user.id);
        sekhra = await Sekhra.findOne({
            _id: req.body.sekhra.id,
            coursier: coursier
        });
    } catch (error) {
        return res.status(HTTP.NOT_FOUND).send({ error });
    }

    if (sekhra.status === statusTypes.DELIVERED) {
        return res.status(HTTP.BAD_REQUEST).send({
            error: 'The sekhra was already deliervered'
        });
    }
    const { status } = req.body.sekhra;
    try {
        await Sekhra.findByIdAndUpdate(sekhra._id, { $set: { status } });
        if (status === statusTypes.DELIVERED) {
            // Update the arrays of finished and current sekhras of coursier
            Coursier.findByIdAndUpdate(
                coursier._id,
                { $pull: { "currentSekhras._id": sekhra._id } },
                { $push: { "finishedSekhras._id": sekhra._id } }
            );
            // Update the arrays of finished and current sekhras of customer
            Customer.findByIdAndUpdate(
                sekhra.customer._id,
                { $pull: { "currentSekhras._id": sekhra._id } },
                { $push: { "finishedSekhras._id": sekhra._id } }
            );
        }
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }

};

module.exports = {
    addSekhra,
    changeSekhraStatus,
    listSekhras
}