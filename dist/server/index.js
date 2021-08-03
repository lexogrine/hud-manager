"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const get_port_1 = __importStar(require("get-port"));
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
require("./sockets/index");
const api_1 = __importStar(require("./api"));
const config_1 = require("./api/config");
const parsePayload = (config) => (req, res, next) => {
    try {
        if (req.body) {
            const payload = req.body.toString();
            const obj = JSON.parse(payload);
            if (obj.provider && obj.provider.appid === 730) {
                if (config.token && (!obj.auth || !obj.auth.token)) {
                    return res.sendStatus(200);
                }
                if (config.token && config.token !== obj.auth.token) {
                    return res.sendStatus(200);
                }
            }
            const text = payload
                .replace(/"(player|owner)":([ ]*)([0-9]+)/gm, '"$1": "$3"')
                .replace(/(player|owner):([ ]*)([0-9]+)/gm, '"$1": "$3"');
            req.body = JSON.parse(text);
        }
        next();
    }
    catch (e) {
        next();
    }
};
exports.app = express_1.default();
exports.server = http_1.default.createServer(exports.app);
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use(express_1.default.raw({ limit: '100Mb', type: 'application/json' }));
exports.app.use(cors_1.default({ origin: '*', credentials: true }));
async function init() {
    let config = await config_1.loadConfig();
    let port = await get_port_1.default({ port: config.port });
    if (port !== config.port) {
        port = await get_port_1.default({ port: get_port_1.makeRange(1300, 50000) });
        console.log(`Port ${config.port} is not available, changing to ${port}`);
        config = await config_1.setConfig({ ...config, port: port });
    }
    console.log(`Server listening on ${port}`);
    if (config.game) {
        api_1.customer.game = config.game;
    }
    exports.app.use(parsePayload(config));
    await api_1.default();
    const io = await socket_1.ioPromise;
    fs_1.default.watch(path_1.default.join(electron_1.app.getPath('home'), 'HUDs'), () => {
        io.emit('reloadHUDs');
    });
    fs_1.default.watch(path_1.default.join(electron_1.app.getPath('userData'), 'ARs'), () => {
        io.emit('reloadHUDs');
    });
    exports.app.use('/', express_1.default.static(path_1.default.join(__dirname, '../build')));
    exports.app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../build/index.html'));
    });
    return exports.server.listen(config.port);
}
exports.default = init;
