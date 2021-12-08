"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfig = exports.saveClips = exports.saveDelay = exports.requestARGStatus = exports.disconnect = exports.connect = exports.getOrder = exports.setOrder = void 0;
const index_1 = require("./index");
const setOrder = async (req, res) => {
    const order = req.body;
    if (!order || !Array.isArray(order))
        return res.sendStatus(422);
    if (index_1.argSocket) {
        index_1.argSocket.order = order;
        index_1.argSocket.socket?.send('config', order.map(item => ({ id: item.id, active: item.active })));
        index_1.argSocket.socket?.send('saveClips', index_1.argSocket.saveClips);
    }
    return res.sendStatus(200);
};
exports.setOrder = setOrder;
const getOrder = async (req, res) => {
    return res.json(index_1.argSocket.order);
};
exports.getOrder = getOrder;
const connect = async (req, res) => {
    const id = req.body.id;
    if (!id || typeof id !== 'string' || index_1.argSocket.socket) {
        return res.sendStatus(422);
    }
    (0, index_1.connectToARG)(req.body.id);
    return res.sendStatus(200);
};
exports.connect = connect;
const disconnect = async (req, res) => {
    try {
        index_1.argSocket.socket?._socket.close();
    }
    catch { }
    return res.sendStatus(200);
};
exports.disconnect = disconnect;
const requestARGStatus = async (req, res) => {
    await (0, index_1.sendARGStatus)();
    return res.sendStatus(200);
};
exports.requestARGStatus = requestARGStatus;
const saveDelay = async (req, res) => {
    if (!req.body?.delay || typeof req.body.delay !== 'number') {
        return res.sendStatus(422);
    }
    index_1.argSocket.delay = req.body.delay;
    await (0, index_1.sendARGStatus)();
    return res.sendStatus(200);
};
exports.saveDelay = saveDelay;
const saveClips = async (req, res) => {
    if (!req.body || !('saveClips' in req.body)) {
        return res.sendStatus(422);
    }
    index_1.argSocket.saveClips = req.body.saveClips;
    index_1.argSocket?.socket?.send('saveClips', index_1.argSocket.saveClips);
    await (0, index_1.sendARGStatus)();
    return res.sendStatus(200);
};
exports.saveClips = saveClips;
const saveConfig = async (req, res) => { };
exports.saveConfig = saveConfig;
