function AppError(name, code, description) {
    Error.call(this);
    Error.captureStackTrace(this);
    this.name = name;
    this.code = code;
    this.description = description;
};

AppError.prototype.__proto__ = Error.prototype;

module.exports = AppError; 