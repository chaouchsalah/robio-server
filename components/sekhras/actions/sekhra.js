const Sekhra = require('../sekhra');
const Route = require('../route');
const Customer = require('../../user/customer');
const Coursier = require('../../user/coursier');
const userTypes = require('../../user/constants/types');
const statusTypes = require('../constants/status');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');
const getCoords = require('../../../web/api/mapQuest/adress');

const addSekhra = async (req, res) => {
    const { from, to, description, items } = req.body.sekhra;
    let fromCoords;
    try {
        fromCoords = await getCoords(from);
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
    const fromLat = fromCoords.lat;
    const fromLong = fromCoords.lng;
    if (!fromLat || !fromLong) {
        res.status(HTTP.BAD_REQUEST).send(
            { error: 'The from address isn\'t right' }
        );
    }
    let toCoords;
    try {
        toCoords = await getCoords(to);
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
    const toLat = toCoords.lat;
    const toLong = toCoords.lng;
    if (!toLat || !toLong) {
        res.status(HTTP.BAD_REQUEST).send(
            { error: 'The to address isn\'t right' }
        );
    }
    let customer;
    try {
        customer = await Customer.findById(req.body.customer._id);
    } catch (error) {
        return res.status(HTTP.NOT_FOUND).send({ error });
    }

    let sekhra = new Sekhra();
    sekhra.items = items;
    sekhra.description = description;
    sekhra.from = [fromLat, fromLong];
    sekhra.to = [toLat, toLong];
    sekhra.customer = customer;
    try {
        await sekhra.save();
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
    const User = req.user.userType === userTypes.CUSTOMER
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
                { $push: { "finishedSekhras": sekhra } }
            );
            // Update the arrays of finished and current sekhras of customer
            Customer.findByIdAndUpdate(
                sekhra.customer._id,
                { $pull: { "currentSekhras._id": sekhra._id } },
                { $push: { "finishedSekhras": sekhra } }
            );
        }
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
};

const getSekhra = async (req, res) => {
    const { id } = req.params;
    try {
        const sekhra = await Sekhra.findById(id);
        const route = await Route.findById(sekhra.route);
        console.log(route);
        sekhra.route = route;
        res.status(HTTP.SUCCESS).send({ sekhra });
    } catch (error) {
        res.status(HTTP.SERVER_ERROR).send({ error });
    }

}


module.exports = {
    addSekhra,
    changeSekhraStatus,
    listSekhras,
    getSekhra
}