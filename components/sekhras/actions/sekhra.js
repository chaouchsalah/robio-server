const Sekhra = require('../sekhra');
const Route = require('../route');
const Customer = require('../../user/customer');
const Coursier = require('../../user/coursier');
const statusTypes = require('../constants/status');
const logger = require('../../../config/logger');
const HTTP = require('../../../constants/statusCode');
const getCoords = require('../../../web/api/mapQuest/adress');
const AppError = require('../../../config/errorHandling');
const sendResponse = require('../../../helpers/errorResponse');

const addSekhra = async (req, res) => {
    const { from, to, description, items } = req.body.sekhra;
    let fromCoords;
    try {
        fromCoords = await getCoords(from);
        const fromLat = fromCoords.lat;
        const fromLong = fromCoords.lng;
        if (!fromLat || !fromLong) {
            const { code, name } = HTTP.BAD_REQUEST;
            throw new AppError(
                name,
                code,
                'The from address isn\'t right'
            );
        }
        let toCoords;
        toCoords = await getCoords(to);
        const toLat = toCoords.lat;
        const toLong = toCoords.lng;
        if (!toLat || !toLong) {
            const { code, name } = HTTP.BAD_REQUEST;
            throw new AppError(
                name,
                code,
                'The to address isn\'t right'
            );
        }
        const { _id } = req.body.customer;
        const customer = await Customer.findById(_id);
        if (!customer) {
            const { code, name } = HTTP.NOT_FOUND;
            throw new AppError(
                name,
                code,
                `Customer with id: ${customer._id} was not found`
            );
        }
        let sekhra = new Sekhra();
        sekhra.items = items;
        sekhra.description = description;
        sekhra.from = [fromLat, fromLong];
        sekhra.to = [toLat, toLong];
        sekhra.customer = customer;
        await sekhra.save();
        await Customer.findOneAndUpdate({ _id: customer._id },
            { $push: { "currentSekhras": sekhra } }
        );
        return res.status(HTTP.CREATED).send({ sekhra });
    } catch (error) {
        return sendResponse(error, res);
    }
};

const listSekhras = async (req, res) => {
    try {
        const { user } = req;
        const sekhras = await Sekhra.find({ $or: [{ coursier: user }, { customer: user }] });
        return res.status(HTTP.SUCCESS).send({ sekhras: sekhras });
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
};

const changeSekhraStatus = async (req, res) => {
    const { user } = req;
    const { sekhraId } = req.body;
    let sekhra;
    try {
        sekhra = await Sekhra.findOne({
            _id: sekhraId,
            coursier: coursier
        });
        if (!sekhra) {
            const { code, name } = HTTP.NOT_FOUND;
            throw new AppError(
                name,
                code,
                `Sekhra with id: ${sekhraId} was not found`
            );
        }
        if (sekhra.status === statusTypes.DELIVERED) {
            const { code, name } = HTTP.BAD_REQUEST;
            throw new AppError(
                name,
                code,
                'This sekhra was already deliervered'
            );
        }
        const { status, _id, customer } = sekhra;
        await Sekhra.findByIdAndUpdate(_id, { $set: { status } });
        if (status === statusTypes.DELIVERED) {
            // Update the arrays of finished and current sekhras of coursier
            Coursier.findByIdAndUpdate(
                user._id,
                { $pull: { "currentSekhras._id": _id } },
                { $push: { "finishedSekhras": sekhra } }
            );
            // Update the arrays of finished and current sekhras of customer
            Customer.findByIdAndUpdate(
                customer._id,
                { $pull: { "currentSekhras._id": _id } },
                { $push: { "finishedSekhras": sekhra } }
            );
        }
    } catch (error) {
        sendResponse(error, res);
    }
};

const getSekhra = async (req, res) => {
    const { id } = req.params;
    try {
        const sekhra = await Sekhra.findById(id);
        const route = await Route.findById(sekhra.route);
        sekhra.route = route;
        return res.status(HTTP.SUCCESS).send({ sekhra });
    } catch (error) {
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
};

const validateSekhra = async (req, res) => {
    const { sekhraId } = req.body;
    try {
        const sekhra = await Sekhra.findByIdAndUpdate(sekhraId, {
            $set: {
                activated: true
            }
        });
        return res.status(HTTP.SUCCESS).send({ sekhra });
    } catch (error) {
        logger.error(error);
        return res.status(HTTP.SERVER_ERROR).send({ error });
    }
}


module.exports = {
    addSekhra,
    changeSekhraStatus,
    listSekhras,
    getSekhra,
    validateSekhra
}