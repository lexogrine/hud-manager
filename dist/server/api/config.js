"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUrl = exports.setConfig = exports.updateConfig = exports.getConfig = exports.loadConfig = exports.internalIP = exports.publicIP = void 0;
const database_1 = require("./../../init/database");
const fs_1 = __importDefault(require("fs"));
const ip_1 = __importDefault(require("ip"));
const public_ip_1 = __importDefault(require("public-ip"));
const internal_ip_1 = __importDefault(require("internal-ip"));
const electron_1 = require("../../electron");
const socket_1 = require("../socket");
const _1 = require(".");
exports.publicIP = null;
exports.internalIP = internal_ip_1.default.v4.sync() || ip_1.default.address();
public_ip_1.default
    .v4()
    .then(ip => {
    exports.publicIP = ip;
})
    .catch();
const defaultConfig = {
    steamApiKey: '',
    token: '',
    port: 1349,
    hlaePath: '',
    afxCEFHudInteropPath: '',
    sync: true,
    cg: false,
    autoSwitch: false
};
const loadConfig = async () => {
    if (!exports.publicIP) {
        try {
            exports.publicIP = await public_ip_1.default.v4();
        }
        catch { }
    }
    return new Promise(res => {
        if (!database_1.databaseContext.databases.config)
            return res(defaultConfig);
        database_1.databaseContext.databases.config.find({}, async (err, config) => {
            if (err) {
                return res(defaultConfig);
            }
            if (config.length) {
                if ((!config[0].hlaePath || fs_1.default.existsSync(config[0].hlaePath)) &&
                    (!config[0].afxCEFHudInteropPath || fs_1.default.existsSync(config[0].afxCEFHudInteropPath))) {
                    return res(config[0]);
                }
                if (config[0].hlaePath && !fs_1.default.existsSync(config[0].hlaePath)) {
                    config[0].hlaePath = '';
                }
                if (config[0].afxCEFHudInteropPath && !fs_1.default.existsSync(config[0].afxCEFHudInteropPath)) {
                    config[0].afxCEFHudInteropPath = '';
                }
                return res(await (0, exports.setConfig)(config[0]));
            }
            database_1.databaseContext.databases.config.insert(defaultConfig, (err, config) => {
                if (err) {
                    return res(defaultConfig);
                }
                return res(config);
            });
        });
    });
};
exports.loadConfig = loadConfig;
const getConfig = async (_req, res) => {
    const config = await (0, exports.loadConfig)();
    if (!config) {
        return res.sendStatus(500);
    }
    const response = { ...config, ip: exports.internalIP };
    return res.json(response);
};
exports.getConfig = getConfig;
const updateConfig = async (req, res) => {
    const io = await socket_1.ioPromise;
    const currentConfig = await (0, exports.loadConfig)();
    const updated = {
        steamApiKey: req.body.steamApiKey,
        port: Number(req.body.port),
        token: req.body.token,
        hlaePath: req.body.hlaePath,
        afxCEFHudInteropPath: req.body.afxCEFHudInteropPath,
        sync: !!req.body.sync,
        cg: !!req.body.cg,
        autoSwitch: !!req.body.autoSwitch,
        game: currentConfig.game
    };
    const config = await (0, exports.setConfig)(updated);
    if (!config) {
        return res.sendStatus(500);
    }
    io.emit('config');
    return res.json(config);
};
exports.updateConfig = updateConfig;
const setConfig = async (config) => new Promise(res => {
    if (!database_1.databaseContext.databases.config)
        return res(defaultConfig);
    database_1.databaseContext.databases.config.update({}, { $set: config }, { multi: true }, async (err) => {
        if (err) {
            return res(defaultConfig);
        }
        const newConfig = await (0, exports.loadConfig)();
        if (!newConfig) {
            return res(defaultConfig);
        }
        if (!_1.customer?.customer || _1.customer.customer.license.type === 'free') {
            newConfig.cg = false;
        }
        return res(newConfig);
    });
});
exports.setConfig = setConfig;
const verifyUrl = async (url) => {
    if (!url || typeof url !== 'string')
        return false;
    const cfg = await (0, exports.loadConfig)();
    if (!cfg) {
        return false;
    }
    const bases = [
        `http://${exports.internalIP}:${cfg.port}`,
        `http://${exports.publicIP}:${cfg.port}`,
        `http://localhost:${cfg.port}`
    ];
    if (electron_1.isDev && url.startsWith(`http://localhost:3000`)) {
        return true;
    }
    if (bases.find(base => url.startsWith(`${base}/dev`))) {
        return true;
    }
    if (bases.find(base => url.startsWith(`${base}/ar/drawing.html`))) {
        return true;
    }
    if (bases.find(base => url.startsWith(`${base}/ar2/examples/default/drawing.html`))) {
        return true;
    }
    const base = bases.find(base => url.startsWith(base));
    if (!base)
        return false;
    let path = url.substr(base.length);
    if (!path || path === '/')
        return true;
    if (!path.endsWith(`/?port=${cfg.port}&isProd=true`))
        return false;
    path = path.substr(0, path.lastIndexOf('/'));
    const pathRegex = /^\/huds\/([a-zA-Z0-9_-]+)$/;
    return pathRegex.test(path);
};
exports.verifyUrl = verifyUrl;
