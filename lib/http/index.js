"use strict";

const bodyParser = require("body-parser");
const express = require("express");
const logger = require("../logger");
const makeTodoController = require("./todo");
const {errorHandler, wrapAsync} = require("./middleware");

const makeServer = (port, basePath, todoService) => {
    basePath = basePath || "/api";
    port = port || 3000;

    const app = express();
    const router = express.Router();

    const todoController = makeTodoController(todoService);

    router.get("/todos", wrapAsync(todoController.getAll));
    router.get("/todos/:id", wrapAsync(todoController.get));
    router.post("/todos", wrapAsync(todoController.post));
    router.put("/todos/:id", wrapAsync(todoController.put));
    router.delete("/todos/:id", wrapAsync(todoController.delete));

    app.use(bodyParser.json());
    app.use(basePath, router);
    app.use(errorHandler);

    return {
        start: () => {
            app.listen(port, () => {
                logger.info(`Listening on port ${port}`);
            });
        },
    };
};

module.exports = makeServer;
