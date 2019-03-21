const Sekhra = require('../sekhra');

module.exports = async function ready(sekhraId, io) {
    try {
        const sekhra = await Sekhra.findById(sekhraId);
        io.sockets.emit('readySekhra', {sekhra});
    }catch(error) {
        logger.error(error);
    }
}