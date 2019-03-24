const AppError = require('../config/errorHandling');
const logger = require('../config/logger');

module.exports = function sendError(error, res) {
    let { code } = HTTP.SERVER_ERROR;
    description = error;
    if (error instanceof AppError) {
        code = error.code;
        description = error.description;
    } else {
        logger.error(error);
    }
    return res.status(code).send({ description });
} 