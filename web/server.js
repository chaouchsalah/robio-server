const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const mainRouter = require('./router');
const userRouter = require('../components/user/config/router');
const authRouter = require('../components/authentication/config/router');
const sekhraRouter = require('../components/sekhras/config/router');
const logger = require('../config/logger');

const app = express();

const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
  };

const server = require('https').Server(options, app);
const io = require('socket.io')(server);

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use(passport.initialize());

// Define routes
mainRouter(app);
userRouter(app);
authRouter(app);
sekhraRouter(app);

const port = process.env.PORT || 6200;

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

io.on('connection', socket => {
    socket.on('position', (data) => {
        console.log(data);
        io.sockets.emit('locateUser', data);
    });
});

app.use((err, request, response, next) => {
    logger.error(err);
    response.status(500).send('Check log files!');
    next();
});