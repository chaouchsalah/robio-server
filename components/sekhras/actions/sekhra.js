const Sekhra = require('../sekhra');
const Customer = require('../../user/customer');
const Coursier = require('../../user/coursier');
const userTypes = require('../../user/types');
const statusTypes = require('../status');
const logger = require('../../../config/logger');
const HTTP = require('../../../config/statusCode');

const addSekhra = (req, res) => {
    if(process.env.USER_TYPE === userTypes.COURSIER) {
        res.status(HTTP.UNAUTHORIZED).send({error: 'Unauthorized'});
    }
    const customer = await Customer.findById(req.user.id,
        (error, customer) => {
            if(error) {
                res.status(HTTP.NOT_FOUND).send({error});
            }
            return customer;
        }
    );
    const coursier = await Coursier.findById(req.body.coursier,
        (error, coursier) => {
            if(error) {
                res.status(HTTP.NOT_FOUND).send({error});
            }
            return coursier;
        }
    );
    let sekhra = new Sekhra(req.body.sekhra);
    sekhra.customer = customer;
    sekhra.coursier = coursier;
    sekhra = await sekhra.save((error, sekhra) => {
        if(error) {
            logger.error(error);
            res.status(HTTP.SERVER_ERROR).send({error});
        }
        return sekhra;
    });
    await Coursier.findByIdAndUpdate(coursier._id, 
        {$push: { "currentSekhras._id": sekhra._id }}, 
        (error) => {
            if(error) {
                logger.error(error);
                res.status(HTTP.SERVER_ERROR).send({error});
            }
        }
    );
    await Customer.findByIdAndUpdate(customer._id, 
        {$push: { "currentSekhras._id": sekhra._id }}, 
        (error) => {
            if(error) {
                logger.error(error);
                res.status(HTTP.SERVER_ERROR).send({error});
            }
        }
    );
    res.status(HTTP.CREATED);
};

const listSekhras = (req, res) => {
    const User = process.env.USER_TYPE === userTypes.CUSTOMER 
        ? Customer : Coursier;
    const user = User.findById(req.user.id, (error, user) => {
        if(error) {
            res.status(HTTP.NOT_FOUND).send({error});
        }
        return user;
    });
    Sekhra.find({$or: [{coursier: user}, {customer: user}]},
        (error, sekhras) => {
            if(error) {
                logger.error(error);
                res.status(HTTP.SERVER_ERROR).send({error});
            }
            res.status(HTTP.SUCCESS).send({sekhras: sekhras});
        }
    );
};

const changeSekhraStatus = async (req, res) => {
    if(process.env.USER_TYPE === userTypes.CUSTOMER) {
        res.status(HTTP.UNAUTHORIZED).send({error: 'Unauthorized'});
    }
    const coursier = await Coursier.findById(req.user.id,
        (error, coursier) => {
            if(error) {
                res.status(HTTP.NOT_FOUND).send({error});
            }
            return coursier;
        }
    );
    const sekhra = await Sekhra.findOne({
        _id: req.body.sekhra.id,
        coursier: coursier
    }, (error, sekhra) => {
            if(error) {
                res.status(HTTP.NOT_FOUND).send({error});
            }
            return sekhra;
        }
    );
    if(sekhra.status === statusTypes.DELIVERED){
        res.status(HTTP.BAD_REQUEST).send({
            error: 'The sekhra was already deliervered'
        });
    }
    const { status } = req.body.sekhra;
    await Sekhra.findByIdAndUpdate(sekhra._id, {$set: { status }}, (error) => {
        if(error) {
            logger.error(error);
            res.status(HTTP.SERVER_ERROR).send({error});
        }
        if(status === statusTypes.DELIVERED) {
            // Update the arrays of finished and current sekhras of coursier
            Coursier.findByIdAndUpdate(coursier._id,
                { $pull: { "currentSekhras._id": sekhra._id } },
                { $push: { "finishedSekhras._id": sekhra._id } },
                (error) => {
                    if(error) {
                        logger.error(error);
                        res.status(HTTP.SERVER_ERROR).send({error});
                    }
                }
            );
            // Update the arrays of finished and current sekhras of customer
            Customer.findByIdAndUpdate(sekhra.customer._id,
                { $pull: { "currentSekhras._id": sekhra._id } },
                { $push: { "finishedSekhras._id": sekhra._id } },
                (error) => {
                    if(error) {
                        logger.error(error);
                        res.status(HTTP.SERVER_ERROR).send({error});
                    }
                }
            );
        }
    });
};

module.exports = {
    addSekhra,
    changeSekhraStatus,
    listSekhras,
    estimateSekhra
}