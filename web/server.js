const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mainRouter = require('./router');
const userRouter = require('../components/user/config/router');
const authRouter = require('../components/authentication/config/router');
const logger = require('../config/logger');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use(passport.initialize());

// Define routes
mainRouter(app);
userRouter(app);
authRouter(app);

const port = process.env.PORT || 6200;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.use((err, request, response, next) => {
    logger.error(err);
    response.status(500).send('Check log files!');
    next();
});