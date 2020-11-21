const createError = require('http-errors');

exports.err404 = (req, res, next) => {
    next(createError(404));
}

exports.errHandler = (err, req, res, next) => {
    res.status(err.status || 500).json(err)
}