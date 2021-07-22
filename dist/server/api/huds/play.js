"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGameConnection = exports.playTesting = void 0;
const __1 = require("..");
const __2 = require("../..");
const socket_1 = require("../../socket");
const testing_1 = require("../testing");
const ws_1 = __importDefault(require("ws"));
const aco_1 = require("../../aco");
const assertUser = (req, res, next) => {
    if (!__1.customer.customer) {
        return res.sendStatus(403);
    }
    return next();
};
exports.playTesting = {
    intervalId: null,
    isOnLoop: false
};
exports.initGameConnection = async () => {
    const io = await socket_1.ioPromise;
    const director = aco_1.createDirector();
    director.pgl = socket_1.mirvPgl;
    io.on('connection', socket => {
        socket.on('getDirectorStatus', () => {
            socket.emit('directorStatus', director.status);
        });
        socket.on('toggleDirector', () => {
            if (!__1.customer.customer ||
                !__1.customer.customer.license ||
                __1.customer.customer.license?.type === 'free' ||
                __1.customer.customer.license?.type === 'personal') {
                return;
            }
            director.status ? director.stop() : director.start();
            socket.emit('directorStatus', director.status);
        });
    });
    let testDataIndex = 0;
    const startSendingTestData = () => {
        if (exports.playTesting.intervalId)
            return;
        if (socket_1.runtimeConfig.last?.provider?.timestamp &&
            new Date().getTime() - socket_1.runtimeConfig.last.provider.timestamp * 1000 <= 5000)
            return;
        io.emit('enableTest', false, exports.playTesting.isOnLoop);
        exports.playTesting.intervalId = setInterval(() => {
            if (!testing_1.testData[testDataIndex]) {
                testDataIndex = 0;
                if (!exports.playTesting.isOnLoop) {
                    stopSendingTestData();
                    return;
                }
            }
            io.to('game').emit('update', testing_1.testData[testDataIndex]);
            testDataIndex++;
        }, 16);
    };
    const stopSendingTestData = () => {
        if (!exports.playTesting.intervalId)
            return;
        clearInterval(exports.playTesting.intervalId);
        exports.playTesting.intervalId = null;
        io.emit('enableTest', true, exports.playTesting.isOnLoop);
    };
    __2.app.post('/', assertUser, (req, res) => {
        socket_1.runtimeConfig.last = req.body;
        if (exports.playTesting.intervalId) {
            clearInterval(exports.playTesting.intervalId);
            exports.playTesting.intervalId = null;
            io.emit('enableTest', true, exports.playTesting.isOnLoop);
        }
        io.to('game').emit('update', req.body);
        socket_1.GSI.digest(req.body);
        res.sendStatus(200);
    });
    const replaceNameForPlayer = (steamid, username) => {
        socket_1.mirvPgl?.socket?.send(new Uint8Array(Buffer.from(`exec\0mirv_replace_name filter add x${steamid} "${username}"\0`, 'utf8')), { binary: true });
    };
    __2.app.post('/api/replaceWithMirv', assertUser, (req, res) => {
        const players = req.body.players;
        if (!players ||
            !Array.isArray(players) ||
            !socket_1.mirvPgl.socket ||
            socket_1.mirvPgl.socket.readyState !== socket_1.mirvPgl.socket.OPEN) {
            return res.sendStatus(403);
        }
        for (const player of players) {
            replaceNameForPlayer(player.steamid, player.name);
        }
        return res.sendStatus(200);
    });
    __2.app.post('/dota2', assertUser, (req, res) => {
        io.to('dota2').emit('update', req.body);
        res.sendStatus(200);
    });
    __2.app.post('/api/test', assertUser, (_req, res) => {
        if (exports.playTesting.intervalId)
            stopSendingTestData();
        else
            startSendingTestData();
        res.sendStatus(200);
    });
    __2.app.post('/api/test/loop', assertUser, (_req, res) => {
        exports.playTesting.isOnLoop = !exports.playTesting.isOnLoop;
        io.emit('enableTest', !exports.playTesting.intervalId, exports.playTesting.isOnLoop);
        res.sendStatus(200);
    });
    const connectToRocketLeague = () => {
        const ws = new ws_1.default('ws://localhost:49122');
        const onData = (data) => {
            io.to('rocketleague').emit('update', data);
        };
        ws.on('message', onData);
        ws.on('close', () => {
            ws.off('message', onData);
            setTimeout(connectToRocketLeague, 1000);
        });
        ws.on('error', ws.close);
    };
    connectToRocketLeague();
};
