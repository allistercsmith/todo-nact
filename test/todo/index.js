"use strict";

const {dispatch, query, start, stop} = require("nact");
const assert = require("chai").assert;
const chance = require("chance").Chance();
const todoActor = require("../../lib/todo");
const {types} = require("../../lib/todo");

describe("Todo Actor", function() {
    let system;

    beforeEach(() => {
        system = start();
    });

    afterEach(() => stop(system));

    it("should return a UNKNOWN_MESSAGE_TYPE message when using an unknown type", async function() {
        const actor = todoActor(system);

        const result = await query(actor, {
            type: chance.sentence(),
        }, 250);

        assert.equal(result.type, types.UNKNOWN_MESSAGE_TYPE);
    });

    it("should retrieve all todos with message type GET_TODOS", async function() {
        const actor = todoActor(system);
        const todos = [];

        for (let i = 0; i < 5; i++) {
            const todo = {
                name: chance.sentence(),
                description: chance.sentence(),
            };

            todos.push(todo);
            dispatch(actor, {
                payload: todo,
                type: types.CREATE_TODO,
            });
        }

        const result = await query(actor, {
            type: types.GET_TODOS,
        }, 250);

        assert.equal(result.type, types.SUCCESS);
        assert.equal(result.payload.length, 5);
    });

    [{
        name: "Get milk",
        description: null,
    }, {
        name: 1,
        description: "Buy milk from the grocery store",
    }, {
        name: null,
        description: 1,
    }].forEach((test, index) => {
        it(`should return a VALIDATION_ERROR message when using CREATE_TODO with invalid payload (case ${index})`, async function() {
            const actor = todoActor(system);

            const result = await query(actor, {
                type: types.CREATE_TODO,
                payload: test,
            }, 250);

            assert.equal(result.type, types.VALIDATION_ERROR);
        });
    });

    it("should return a SUCCESS message when using CREATE_TODO with a valid payload", async function() {
        const actor = todoActor(system);
        const todo = {
            name: chance.sentence(),
            description: chance.sentence(),
        };

        const result = await query(actor, {
            type: types.CREATE_TODO,
            payload: todo,
        }, 250);

        assert.equal(result.type, types.SUCCESS);
        assert.equal(result.payload.name, todo.name);
        assert.equal(result.payload.description, todo.description);
    });

    [types.GET_TODO, types.REMOVE_TODO, types.UPDATE_TODO].forEach((type) => {
        it(`should return a NOT_FOUND message when using ${type}, and the todo doesn't exist`, async function() {
            const actor = todoActor(system);

            const result = await query(actor, {
                type,
                todoId: chance.guid(),
            }, 250);

            assert.equal(result.type, types.NOT_FOUND);
        });
    });

    it("should retrieve a single todo with message type GET_TODO", async function() {
        const actor = todoActor(system);
        const todo = {
            name: chance.sentence(),
            description: chance.sentence(),
        };

        dispatch(actor, {
            payload: todo,
            type: types.CREATE_TODO,
        });

        let result = await query(actor, {
            type: types.GET_TODOS,
        }, 250);

        result = await query(actor, {
            type: types.GET_TODO,
            todoId: result.payload[0].id,
        }, 250);

        assert.equal(result.type, types.SUCCESS);
        assert.equal(result.payload.name, todo.name);
        assert.equal(result.payload.description, todo.description);
    });

    it("should remove a single todo with message type REMOVE_TODO", async function() {
        const actor = todoActor(system);
        const todo = {
            name: chance.sentence(),
            description: chance.sentence(),
        };

        dispatch(actor, {
            payload: todo,
            type: types.CREATE_TODO,
        });

        let result = await query(actor, {
            type: types.GET_TODOS,
        }, 250);

        result = await query(actor, {
            type: types.REMOVE_TODO,
            todoId: result.payload[0].id,
        }, 250);

        assert.equal(result.type, types.SUCCESS);
        assert.equal(result.payload.name, todo.name);
        assert.equal(result.payload.description, todo.description);

        result = await query(actor, {
            type: types.GET_TODOS,
        }, 250);

        assert.equal(result.payload.length, 0);
    });

    it("should update a single todo with message type UPDATE_TODO", async function() {
        const actor = todoActor(system);
        const oldTodo = {
            name: chance.sentence(),
            description: chance.sentence(),
        };

        const newTodo = {
            name: chance.sentence(),
            description: chance.sentence(),
        };

        dispatch(actor, {
            payload: oldTodo,
            type: types.CREATE_TODO,
        });

        let result = await query(actor, {
            type: types.GET_TODOS,
        }, 250);

        result = await query(actor, {
            type: types.UPDATE_TODO,
            todoId: result.payload[0].id,
            payload: newTodo,
        }, 250);

        assert.equal(result.type, types.SUCCESS);
        assert.equal(result.payload.name, newTodo.name);
        assert.equal(result.payload.description, newTodo.description);
    });
});
