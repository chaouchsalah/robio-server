const jwt = require('jwt-simple');

module.exports = function generateJWT(id) {
    const timeStamp = new Date().getTime();
    return jwt.encode({ sub: id, iat: timeStamp }, process.env.JWT_SECRET);
}