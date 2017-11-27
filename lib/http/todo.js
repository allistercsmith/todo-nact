"use strict";

const {query} = require("nact");
const {types} = require("../todo");

const makeTodoController = (todoService) => {
    return {
        getAll: async (req, res, next) => {
            try {
                const result = await query(todoService, {
                    type: types.GET_TODOS,
                }, 250);

                if (result.type === types.SUCCESS) {
                    res.status(200).json(result.payload);
                } else {
                    next(new Error(`Unknown result type ${result.type}`));
                }
            } catch (err) {
                next(err);
            }
        },
        get: async (req, res, next) => {
            const todoId = req.params.id;

            try {
                const result = await query(todoService, {
                    type: types.GET_TODO,
                    todoId,
                }, 250);

                if (result.type === types.NOT_FOUND) {
                    res.status(404).json("Todo not found");
                } else if (result.type === types.SUCCESS) {
                    res.status(200).json(result.payload);
                } else {
                    next(new Error(`Unknown result type ${result.type}`));
                }
            } catch (err) {
                next(err);
            }
        },
        post: async (req, res, next) => {
            const payload = req.body;

            try {
                const result = await query(todoService, {
                    type: types.CREATE_TODO,
                    payload,
                }, 250);

                if (result.type === types.SUCCESS) {
                    res.status(201).json(result.payload);
                } else if (result.type === types.VALIDATION_ERROR) {
                    res.status(400).json(result.payload);
                } else {
                    next(new Error(`Unknown result type ${result.type}`));
                }
            } catch (err) {
                next(err);
            }
        },
        put: async (req, res, next) => {
            const todoId = req.params.id;
            const payload = req.body;

            try {
                const result = await query(todoService, {
                    type: types.UPDATE_TODO,
                    todoId,
                    payload,
                }, 250);

                if (result.type === types.NOT_FOUND) {
                    res.status(404).json("Todo not found");
                } else if (result.type === types.SUCCESS) {
                    res.status(200).json(result.payload);
                } else if (result.type === types.VALIDATION_ERROR) {
                    res.status(400).json(result.payload);
                } else {
                    next(new Error(`Unknown result type ${result.type}`));
                }
            } catch (err) {
                next(err);
            }
        },
        delete: async (req, res, next) => {
            const todoId = req.params.id;

            try {
                const result = await query(todoService, {
                    type: types.REMOVE_TODO,
                    todoId,
                }, 250);

                if (result.type === types.NOT_FOUND) {
                    res.status(404).json("Todo not found");
                } else if (result.type === types.SUCCESS) {
                    res.status(204).send();
                } else {
                    next(new Error(`Unknown result type ${result.type}`));
                }
            } catch (err) {
                next(err);
            }
        },
    };
};

module.exports = makeTodoController;
