"use strict";

const Promise = require("bluebird");

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        next();

        return;
    }

    const status = err.status || 500;
    const message = (status < 500) ? err.message : "An unknown error occured";

    res.status(status).error(message);
};

const wrapAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    wrapAsync,
};
