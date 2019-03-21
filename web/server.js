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
const estimateSekhra = require('../components/sekhras/actions/sekhraEstimation');
const readySekhra = require('../components/sekhras/actions/sekhraReady');

const app = express();

const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
};

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use(passport.initialize());

const server = require('https').Server(options, app);
const io = require('socket.io')(server);

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
    socket.on('addSekhra', (data) => {
        estimateSekhra(data, io);
    });
    socket.on('acceptSekhra', (data) => {
        const { users, sekhra } = data;
        readySekhra(sekhra, io);
        io.sockets.emit('deleteNotification', { users });
    })
    socket.on('position', (data) => {
        io.sockets.emit('locateUser', data);
    });
});

app.use((err, request, response, next) => {
    logger.error(err);
    response.status(500).send('Check log files!');
    next();
});