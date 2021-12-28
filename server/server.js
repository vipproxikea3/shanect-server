require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
app.use(morgan('tiny'));

const route = require('./routes');
const port = process.env.PORT || 9000;
const db = require('./config/db');
db.connect();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const socketIo = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});

socketIo.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.io = socketIo;

route(app);

server.listen(port, () => {
    console.log(`server running in port ${port}`);
});
