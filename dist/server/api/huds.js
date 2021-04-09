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
exports.deleteHUD = exports.uploadHUD = exports.closeHUD = exports.showHUD = exports.legacyCSS = exports.legacyJS = exports.renderLegacy = exports.renderAssets = exports.getThumbPath = exports.renderThumbnail = exports.renderOverlay = exports.render = exports.verifyOverlay = exports.renderHUD = exports.openHUDsDirectory = exports.getHUDPanelSetting = exports.getHUDKeyBinds = exports.getHUDData = exports.getHUDs = exports.listHUDs = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const socket_1 = require("./../socket");
const huds_1 = __importDefault(require("./../../init/huds"));
const overlay_1 = __importDefault(require("./overlay"));
const DecompressZip = require('decompress-zip');
const remove = (pathToRemove) => {
    if (!fs.existsSync(pathToRemove)) {
        return;
    }
    const files = fs.readdirSync(pathToRemove);
    files.forEach(function (file) {
        const current = path.join(pathToRemove, file);
        if (fs.lstatSync(current).isDirectory()) {
            // recurse
            remove(current);
            if (fs.existsSync(current))
                fs.rmdirSync(current);
        }
        else {
            // delete file
            if (fs.existsSync(current))
                fs.unlinkSync(current);
        }
    });
    fs.rmdirSync(pathToRemove);
};
exports.listHUDs = async () => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs');
    const filtered = fs
        .readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .filter(dirent => /^[0-9a-zA-Z-_]+$/g.test(dirent.name));
    const huds = (await Promise.all(filtered.map(async (dirent) => await exports.getHUDData(dirent.name)))).filter(hud => hud !== null);
    if (socket_1.HUDState.devHUD) {
        huds.unshift(socket_1.HUDState.devHUD);
    }
    return huds;
};
exports.getHUDs = async (req, res) => {
    return res.json(await exports.listHUDs());
};
exports.getHUDData = async (dirName) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', dirName);
    const configFileDir = path.join(dir, 'hud.json');
    const globalConfig = await config_1.loadConfig();
    if (!globalConfig)
        return null;
    if (!fs.existsSync(configFileDir)) {
        if (!socket_1.HUDState.devHUD)
            return null;
        if (socket_1.HUDState.devHUD.dir === dirName) {
            return socket_1.HUDState.devHUD;
        }
        return null;
    }
    try {
        const configFile = fs.readFileSync(configFileDir, { encoding: 'utf8' });
        const config = JSON.parse(configFile);
        config.dir = dirName;
        const panel = exports.getHUDPanelSetting(dirName);
        const keybinds = exports.getHUDKeyBinds(dirName);
        if (panel) {
            config.panel = panel;
        }
        if (keybinds) {
            config.keybinds = keybinds;
        }
        config.url = `http://${config_1.internalIP}:${globalConfig.port}/hud/${dirName}/`;
        config.isDev = false;
        return config;
    }
    catch (e) {
        return null;
    }
};
exports.getHUDKeyBinds = (dirName) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', dirName);
    const keybindsFileDir = path.join(dir, 'keybinds.json');
    if (!fs.existsSync(keybindsFileDir)) {
        return null;
    }
    try {
        const keybindsFile = fs.readFileSync(keybindsFileDir, { encoding: 'utf8' });
        const keybinds = JSON.parse(keybindsFile);
        return keybinds;
    }
    catch (e) {
        return null;
    }
};
exports.getHUDPanelSetting = (dirName) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', dirName);
    const panelFileDir = path.join(dir, 'panel.json');
    if (!fs.existsSync(panelFileDir)) {
        return null;
    }
    try {
        const panelFile = fs.readFileSync(panelFileDir, { encoding: 'utf8' });
        const panel = JSON.parse(panelFile);
        panel.dir = dirName;
        return panel;
    }
    catch (e) {
        return null;
    }
};
exports.openHUDsDirectory = async (_req, res) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs');
    electron_1.shell.openPath(dir);
    return res.sendStatus(200);
};
exports.renderHUD = async (req, res, next) => {
    const cfg = await config_1.loadConfig();
    if (!cfg) {
        return res.sendStatus(500);
    }
    const availableUrls = [
        `http://${config_1.internalIP}:${cfg.port}/hud/${req.params.dir}/`,
        `http://${config_1.publicIP}:${cfg.port}/hud/${req.params.dir}/`,
        `http://localhost:${cfg.port}/hud/${req.params.dir}/`
    ];
    if (!req.params.dir) {
        return res.sendStatus(404);
    }
    if (!req.headers?.referer) {
        return res.sendStatus(403);
    }
    if (!availableUrls.includes(req.headers.referer)) {
        return res.status(403).json({
            expected: availableUrls,
            given: req.headers.referer
        });
    }
    const data = await exports.getHUDData(req.params.dir);
    if (!data) {
        return res.sendStatus(404);
    }
    if (data.legacy) {
        return exports.renderLegacy(req, res, next);
    }
    return exports.render(req, res, next);
};
exports.verifyOverlay = async (req, res, next) => {
    const cfg = await config_1.loadConfig();
    if (!cfg) {
        return res.sendStatus(500);
    }
    const requestUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const availableUrls = [
        `http://${config_1.internalIP}:${cfg.port}/dev`,
        `http://${config_1.publicIP}:${cfg.port}/dev`,
        `http://localhost:${cfg.port}/dev`
    ];
    if (requestUrl === `http://localhost:${cfg.port}/dev/thumb.png` ||
        availableUrls.find(url => `${url}/thumb.png` === requestUrl)) {
        return next();
    }
    if (availableUrls.every(url => !(req.headers.referer || '').startsWith(url))) {
        return res.status(403).json({
            expected: availableUrls,
            given: req.headers.referer
        });
    }
    return next();
};
exports.render = (req, res) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', req.params.dir);
    return res.sendFile(path.join(dir, 'index.html'));
};
exports.renderOverlay = (devHUD = false) => async (req, res) => {
    const cfg = await config_1.loadConfig();
    if (!cfg) {
        return res.sendStatus(500);
    }
    if (!devHUD) {
        return res.send(overlay_1.default(`/huds/${req.params.dir}/?port=${cfg.port}&isProd=true`));
    }
    return res.send(overlay_1.default(`/dev/?port=${cfg.port}`));
};
exports.renderThumbnail = (req, res) => {
    return res.sendFile(exports.getThumbPath(req.params.dir));
};
exports.getThumbPath = (dir) => {
    const thumbPath = path.join(electron_1.app.getPath('home'), 'HUDs', dir, 'thumb.png');
    if (fs.existsSync(thumbPath)) {
        return thumbPath;
    }
    return path.join(__dirname, '../../assets/icon.png');
};
exports.renderAssets = async (req, res, next) => {
    if (!req.params.dir) {
        return res.sendStatus(404);
    }
    const data = await exports.getHUDData(req.params.dir);
    if (!data) {
        return res.sendStatus(404);
    }
    return express_1.default.static(path.join(electron_1.app.getPath('home'), 'HUDs', req.params.dir))(req, res, next);
};
exports.renderLegacy = async (req, res) => {
    const cfg = await config_1.loadConfig();
    if (!cfg) {
        return res.sendStatus(500);
    }
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', req.params.dir);
    return res.render(path.join(dir, 'template.pug'), {
        ip: 'localhost',
        port: cfg.port,
        avatars: false,
        hud: path.join('/huds', req.params.dir, 'index.js'),
        css: path.join('/huds', req.params.dir, 'style.css'),
        delay: 0
    });
};
exports.legacyJS = (req, res) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', req.params.hudName, 'index.js');
    if (!fs.existsSync(dir)) {
        return res.sendStatus(404);
    }
    try {
        const file = fs.readFileSync(dir, { encoding: 'utf8' });
        res.setHeader('Content-Type', 'application/javascript');
        return res.end(file);
    }
    catch (e) {
        return res.sendStatus(404);
    }
};
exports.legacyCSS = (req, res) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', req.params.hudName, 'style.css');
    if (!fs.existsSync(dir)) {
        return res.sendStatus(404);
    }
    try {
        const file = fs.readFileSync(dir, { encoding: 'utf8' });
        res.setHeader('Content-Type', 'text/css');
        return res.end(file);
    }
    catch (e) {
        return res.sendStatus(404);
    }
};
exports.showHUD = async (req, res) => {
    const response = await huds_1.default.open(req.params.hudDir);
    if (response) {
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
};
exports.closeHUD = (req, res) => {
    const response = huds_1.default.close();
    if (response) {
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
};
exports.uploadHUD = async (req, res) => {
    if (!req.body.hud || !req.body.name)
        return res.sendStatus(422);
    const response = await loadHUD(req.body.hud, req.body.name);
    if (response) {
        const notification = new electron_1.Notification({
            title: 'HUD Upload',
            body: `${response.name} uploaded successfully`,
            icon: exports.getThumbPath(response.dir)
        });
        notification.show();
    }
    return res.sendStatus(response ? 200 : 500);
};
exports.deleteHUD = async (req, res) => {
    const io = await socket_1.ioPromise;
    if (!req.query.hudDir || typeof req.query.hudDir !== 'string' || huds_1.default.current)
        return res.sendStatus(422);
    const hudPath = path.join(electron_1.app.getPath('home'), 'HUDs', req.query.hudDir);
    if (!fs.existsSync(hudPath)) {
        return res.sendStatus(200);
    }
    try {
        remove(hudPath);
        io.emit('reloadHUDs');
        return res.sendStatus(200);
    }
    catch {
        return res.sendStatus(500);
    }
};
function removeArchives() {
    const files = fs.readdirSync('./').filter(file => file.startsWith('hud_temp_') && file.endsWith('.zip'));
    files.forEach(file => {
        try {
            if (fs.lstatSync(file).isDirectory()) {
                return;
            }
            if (fs.existsSync(file))
                fs.unlinkSync(file);
        }
        catch { }
    });
}
async function loadHUD(base64, name) {
    const getRandomString = () => (Math.random() * 1000 + 1)
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 15);
    removeArchives();
    return new Promise(res => {
        let hudDirName = name.replace(/[^a-zA-Z0-9-_]/g, '');
        let hudPath = path.join(electron_1.app.getPath('home'), 'HUDs', hudDirName);
        if (fs.existsSync(hudPath)) {
            hudDirName = `${hudDirName}-${getRandomString()}`;
            hudPath = path.join(electron_1.app.getPath('home'), 'HUDs', hudDirName);
        }
        try {
            const fileString = base64.split(';base64,').pop();
            const tempArchiveName = `./hud_temp_archive_${getRandomString()}.zip`;
            fs.writeFileSync(tempArchiveName, fileString, { encoding: 'base64', mode: 777 });
            const tempUnzipper = new DecompressZip(tempArchiveName);
            tempUnzipper.on('extract', async () => {
                if (fs.existsSync(path.join(hudPath, 'hud.json'))) {
                    const hudFile = fs.readFileSync(path.join(hudPath, 'hud.json'), { encoding: 'utf8' });
                    const hud = JSON.parse(hudFile);
                    if (!hud.name) {
                        throw new Error();
                    }
                    const hudData = await exports.getHUDData(path.basename(hudPath));
                    removeArchives();
                    res(hudData);
                }
                else {
                    throw new Error();
                }
            });
            tempUnzipper.on('error', () => {
                if (fs.existsSync(hudPath)) {
                    remove(hudPath);
                }
                removeArchives();
                res(null);
            });
            tempUnzipper.extract({
                path: hudPath
            });
            /**/
        }
        catch {
            if (fs.existsSync(hudPath)) {
                remove(hudPath);
            }
            removeArchives();
            res(null);
        }
    });
}
