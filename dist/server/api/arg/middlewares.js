"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDelay = exports.requestARGStatus = exports.disconnect = exports.connect = void 0;
const index_1 = require("./index");
const connect = async (req, res) => {
    const id = req.body.id;
    if (!id || typeof id !== "string" || index_1.argSocket.socket) {
        return res.sendStatus(422);
    }
    index_1.connectToARG(req.body.id);
    return res.sendStatus(200);
};
exports.connect = connect;
const disconnect = async (req, res) => {
    try {
        index_1.argSocket.socket?._socket.close();
    }
    catch {
    }
    return res.sendStatus(200);
};
exports.disconnect = disconnect;
const requestARGStatus = async (req, res) => {
    await index_1.sendARGStatus();
    return res.sendStatus(200);
};
exports.requestARGStatus = requestARGStatus;
const saveDelay = async (req, res) => {
    if (!req.body?.delay || typeof req.body.delay !== "number") {
        return res.sendStatus(422);
    }
    index_1.argSocket.delay = req.body.delay;
    await index_1.sendARGStatus();
    return res.sendStatus(200);
};
exports.saveDelay = saveDelay;
