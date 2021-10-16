require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(morgan('tiny'));

const route = require('./routes');
const port = process.env.PORT || 9000;
const db = require('./config/db');
db.connect();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

route(app);

app.listen(port, () => {
    console.log(`server running in port ${port}`);
});
