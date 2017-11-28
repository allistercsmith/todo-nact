"use strict";

const {dispatch, spawn} = require("nact");
const Joi = require("joi");
const uuid = require("uuid");

const types = {
    GET_TODOS: "GET_TODOS",
    GET_TODO: "GET_TODO",
    UPDATE_TODO: "UPDATE_TODO",
    REMOVE_TODO: "REMOVE_TODO",
    CREATE_TODO: "CREATE_TODO",
    SUCCESS: "SUCCESS",
    NOT_FOUND: "NOT_FOUND",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    UNKNOWN_MESSAGE_TYPE: "UNKNOWN_MESSAGE_TYPE",
};

const spawnTodoService = (parent) => spawn(
    parent,
    (state = {
        todos: {},
    }, msg, ctx) => {
        const type = msg.type;

        if (type === types.GET_TODOS) {
            dispatch(ctx.sender, {
                payload: Object.values(state.todos),
                type: types.SUCCESS,
            }, ctx.self);
        } else if (type === types.CREATE_TODO) {
            const validation = Joi.validate(msg.payload, Joi.object({
                name: Joi.string().required(),
                description: Joi.string().required(),
            }), {
                stripUnknown: {
                    objects: true,
                },
                abortEarly: false,
            });

            if (validation.error) {
                const errors = validation.error.details.map((detail) => ({
                    field: detail.path,
                    message: detail.message,
                }));

                dispatch(ctx.sender, {
                    payload: errors,
                    type: types.VALIDATION_ERROR,
                }, ctx.self);
            } else {
                const newTodo = {
                    id: uuid(),
                    ...validation.value,
                };

                const nextState = {
                    todos: {
                        ...state.todos,
                        [newTodo.id]: newTodo,
                    },
                };

                dispatch(ctx.sender, {
                    payload: newTodo,
                    type: types.SUCCESS,
                }, ctx.self);

                return nextState;
            }
        } else if (type === types.GET_TODO || type === types.REMOVE_TODO || type === types.UPDATE_TODO) {
            const todo = state.todos[msg.todoId];

            if (todo) {
                switch (type) {
                    case types.GET_TODO: {
                        dispatch(ctx.sender, {
                            payload: todo,
                            type: types.SUCCESS,
                        }, ctx.self);

                        break;
                    }
                    case types.REMOVE_TODO: {
                        dispatch(ctx.sender, {
                            payload: todo,
                            type: types.SUCCESS,
                        }, ctx.self);

                        const todos = Object.assign({}, state.todos);
                        delete todos[msg.todoId];

                        return {
                            todos,
                        };
                    }
                    case types.UPDATE_TODO: {
                        const validation = Joi.validate(msg.payload, Joi.object({
                            name: Joi.string(),
                            description: Joi.string(),
                        }), {
                            stripUnknown: {
                                objects: true,
                            },
                            abortEarly: false,
                        });

                        if (validation.error) {
                            const errors = validation.error.details.map((detail) => ({
                                field: detail.path,
                                message: detail.message,
                            }));

                            dispatch(ctx.sender, {
                                payload: errors,
                                type: types.VALIDATION_ERROR,
                            }, ctx.self);

                            break;
                        } else {
                            const updatedTodo = {...todo, ...msg.payload};
                            const nextState = {
                                todos: {
                                    ...state.todos,
                                    [updatedTodo.id]: updatedTodo,
                                },
                            };

                            dispatch(ctx.sender, {
                                type: types.SUCCESS,
                                payload: updatedTodo,
                            });

                            return nextState;
                        }
                    }
                }
            } else {
                dispatch(ctx.sender, {
                    type: types.NOT_FOUND,
                }, ctx.self);
            }
        } else {
            dispatch(ctx.sender, {
                type: types.UNKNOWN_MESSAGE_TYPE,
            }, ctx.self);
        }

        return state;
    },
    "todo"
);

module.exports = spawnTodoService;
module.exports.types = types;
