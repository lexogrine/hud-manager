"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUrl = exports.setConfig = exports.updateConfig = exports.getConfig = exports.loadConfig = exports.internalIP = exports.publicIP = void 0;
const database_1 = __importDefault(require("./../../init/database"));
const fs_1 = __importDefault(require("fs"));
const ip_1 = __importDefault(require("ip"));
const public_ip_1 = __importDefault(require("public-ip"));
const internal_ip_1 = __importDefault(require("internal-ip"));
const configs = database_1.default.config;
exports.publicIP = null;
exports.internalIP = internal_ip_1.default.v4.sync() || ip_1.default.address();
public_ip_1.default
    .v4()
    .then(ip => {
    exports.publicIP = ip;
})
    .catch();
const defaultConfig = { steamApiKey: '', token: '', port: 1349, hlaePath: '', afxCEFHudInteropPath: '' };
exports.loadConfig = async () => {
    return new Promise(res => {
        configs.find({}, async (err, config) => {
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
                return res(await exports.setConfig(config[0]));
            }
            configs.insert(defaultConfig, (err, config) => {
                if (err) {
                    return res(defaultConfig);
                }
                return res(config);
            });
        });
    });
};
exports.getConfig = async (_req, res) => {
    const config = await exports.loadConfig();
    if (!config) {
        return res.sendStatus(500);
    }
    const response = { ...config, ip: exports.internalIP };
    return res.json(response);
};
exports.updateConfig = (io) => async (req, res) => {
    const updated = {
        steamApiKey: req.body.steamApiKey,
        port: Number(req.body.port),
        token: req.body.token,
        hlaePath: req.body.hlaePath,
        afxCEFHudInteropPath: req.body.afxCEFHudInteropPath
    };
    const config = await exports.setConfig(updated);
    if (!config) {
        return res.sendStatus(500);
    }
    io.emit('config');
    return res.json(config);
};
exports.setConfig = async (config) => new Promise(res => {
    configs.update({}, { $set: config }, {}, async (err) => {
        if (err) {
            return res(defaultConfig);
        }
        const newConfig = await exports.loadConfig();
        if (!newConfig) {
            return res(defaultConfig);
        }
        return res(newConfig);
    });
});
exports.verifyUrl = async (url) => {
    if (!url || typeof url !== 'string')
        return false;
    const cfg = await exports.loadConfig();
    if (!cfg) {
        return false;
    }
    const bases = [`http://${exports.internalIP}:${cfg.port}`, `http://${exports.publicIP}:${cfg.port}`];
    if (process.env.DEV === 'true') {
        bases.push(`http://localhost:3000/?port=${cfg.port}`);
    }
    if (bases.find(base => url.startsWith(`${base}/dev`))) {
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
