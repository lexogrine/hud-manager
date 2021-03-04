"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGameConnection = void 0;
const __1 = require("..");
const __2 = require("../..");
const socket_1 = require("../../socket");
const testing_1 = require("../testing");
const radar = require('./../../../boltobserv/index.js');
const assertUser = (req, res, next) => {
    if (!__1.customer.customer) {
        return res.sendStatus(403);
    }
    return next();
};
exports.initGameConnection = async () => {
    const io = await socket_1.ioPromise;
    let intervalId = null;
    let testDataIndex = 0;
    const startSendingTestData = () => {
        if (intervalId)
            return;
        if (socket_1.runtimeConfig.last?.provider?.timestamp &&
            new Date().getTime() - socket_1.runtimeConfig.last.provider.timestamp * 1000 <= 5000)
            return;
        io.emit('enableTest', false);
        intervalId = setInterval(() => {
            if (!testing_1.testData[testDataIndex]) {
                stopSendingTestData();
                testDataIndex = 0;
                return;
            }
            io.to('csgo').emit('update', testing_1.testData[testDataIndex]);
            testDataIndex++;
        }, 16);
    };
    const stopSendingTestData = () => {
        if (!intervalId)
            return;
        clearInterval(intervalId);
        intervalId = null;
        io.emit('enableTest', true);
    };
    __2.app.post('/', assertUser, (req, res) => {
        if (!__1.customer.customer) {
            return res.sendStatus(200);
        }
        socket_1.runtimeConfig.last = req.body;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            io.emit('enableTest', true);
        }
        io.to('csgo').emit('update', req.body);
        socket_1.GSI.digest(req.body);
        radar.digestRadar(req.body);
        res.sendStatus(200);
    });
    __2.app.post('/api/test', assertUser, (_req, res) => {
        res.sendStatus(200);
        if (intervalId)
            stopSendingTestData();
        else
            startSendingTestData();
    });
};
