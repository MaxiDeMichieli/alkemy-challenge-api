const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
const {err404, errHandler} = require('./middleware/errors');

const usersRouter = require('./routes/users');
const operationsRouter = require('./routes/operations');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/operations', operationsRouter);

// catch 404 and forward to error handler
app.use(err404);
// error handler
app.use(errHandler);

module.exports = app;