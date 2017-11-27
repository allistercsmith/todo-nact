"use strict";

const {start} = require("nact");
const server = require("./http");
const todo = require("./todo");

const system = start();
const todoService = todo(system);

const app = server(3000, "/api", todoService);

app.start();
