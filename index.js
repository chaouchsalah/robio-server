require('dotenv').config();
require('./config/checkEnvVariables');
require('./web/server');
require('./config/db');
const cron = require('node-cron');
const getTodayDate = require('./helpers/todayDate');
const logger = require('./config/logger');

// Will run at 12:00 PM everyday
cron.schedule('0 00 * * *', function() {
    process.env.LOG_DATE = getTodayDate();
    // TODO: Save log of previous day into DB
});

// Log all uncaught errors
process.on('uncaughtException', function(err) {
    logger.error(err);
});

process.on('unhandledRejection', function(err) {
    logger.error(err);
});