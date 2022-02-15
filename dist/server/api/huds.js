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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singHUDByDir = exports.signHUD = exports.uploadHUD = exports.deleteHUDFromCloud = exports.downloadHUD = exports.removeArchives = exports.sendActionByHTTP = exports.deleteHUD = exports.sendHUD = exports.closeHUD = exports.showHUD = exports.legacyCSS = exports.legacyJS = exports.renderLegacy = exports.renderAssets = exports.getThumbPath = exports.renderThumbnail = exports.renderOverlay = exports.render = exports.verifyOverlay = exports.renderHUD = exports.openHUDsDirectory = exports.getHUDPanelSetting = exports.getHUDKeyBinds = exports.getHUDData = exports.getHUDARSettings = exports.getHUDCustomAsset = exports.getHUDs = exports.listHUDs = exports.remove = exports.getRandomString = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const socket_1 = require("./../socket");
const huds_1 = __importDefault(require("./../../init/huds"));
const overlay_1 = __importDefault(require("./overlay"));
const v4_1 = __importDefault(require("uuid/v4"));
const user_1 = require("./user");
const archiver_1 = __importDefault(require("archiver"));
const _1 = require(".");
const isSvg_1 = __importDefault(require("../../src/isSvg"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DecompressZip = require('decompress-zip');
const getRandomString = () => (Math.random() * 1000 + 1)
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 15);
exports.getRandomString = getRandomString;
const remove = (pathToRemove) => {
    if (!fs.existsSync(pathToRemove)) {
        return;
    }
    const files = fs.readdirSync(pathToRemove);
    files.forEach(function (file) {
        const current = path.join(pathToRemove, file);
        if (fs.lstatSync(current).isDirectory()) {
            // recurse
            (0, exports.remove)(current);
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
exports.remove = remove;
const verifyUniqueID = (hudDir) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', hudDir, 'uuid.lhm');
    if (fs.existsSync(dir)) {
        return fs.readFileSync(dir, 'utf8');
    }
    const uuid = (0, v4_1.default)();
    fs.writeFileSync(dir, uuid, 'utf8');
    return uuid;
};
const getOnlineHUDs = async () => {
    if (!_1.customer.game)
        return [];
    try {
        let url = `storage/file/${_1.customer.game}`;
        if (_1.customer.customer && _1.customer.workspace) {
            url += `?&teamId=${_1.customer.workspace.id}`;
        }
        const onlineHUDData = ((await (0, user_1.api)(url)) || []);
        const huds = onlineHUDData.map(data => {
            const hud = {
                ...data.extra,
                uuid: data.uuid
            };
            return hud;
        });
        return huds;
    }
    catch {
        return [];
    }
};
const listHUDs = async () => {
    if (!_1.customer || !_1.customer.game)
        return [];
    const onlineHUDs = await getOnlineHUDs();
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs');
    const filtered = fs.existsSync(dir)
        ? fs
            .readdirSync(dir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => /^[0-9a-zA-Z-_]+$/g.test(dirent.name))
        : [];
    const huds = (await Promise.all(filtered.map(async (dirent) => await (0, exports.getHUDData)(dirent.name)))).filter(hud => hud !== null);
    if (_1.customer.workspace ||
        (_1.customer.customer &&
            (_1.customer.customer.license.type === 'professional' || _1.customer.customer.license.type === 'enterprise'))) {
        const premiumCSGOHUD = await (0, exports.getHUDData)('premiumhud', true);
        if (premiumCSGOHUD)
            huds.unshift(premiumCSGOHUD);
    }
    if (socket_1.HUDState.devHUD) {
        huds.unshift(socket_1.HUDState.devHUD);
    }
    const onlineOnlyHUDs = onlineHUDs.filter(hud => !huds.map(hud => hud.uuid).includes(hud.uuid));
    huds.push(...onlineOnlyHUDs);
    const mapHUDStatus = (hud) => {
        hud.status = 'LOCAL';
        if (onlineOnlyHUDs.map(hud => hud.uuid).includes(hud.uuid)) {
            hud.status = 'REMOTE';
        }
        else if (onlineHUDs.map(hud => hud.uuid).includes(hud.uuid)) {
            hud.status = 'SYNCED';
        }
        return hud;
    };
    return huds
        .map(mapHUDStatus)
        .filter(hud => _1.customer.game === hud.game || (_1.customer.game === 'csgo' && !hud.game) || hud.game === 'all');
};
exports.listHUDs = listHUDs;
const getHUDs = async (req, res) => {
    return res.json(await (0, exports.listHUDs)());
};
exports.getHUDs = getHUDs;
const isJSON = (data) => {
    if (!data || typeof data !== 'string')
        return false;
    try {
        const json = JSON.parse(data);
        return true;
    }
    catch {
        return false;
    }
};
const getHUDCustomAsset = async (req, res) => {
    const { section, asset } = req.params;
    const isDev = req.query.isDev === 'true';
    let { hudDir } = req.params;
    if (isDev && socket_1.HUDState.devHUD?.dir) {
        hudDir = socket_1.HUDState.devHUD.dir;
    }
    const hudData = socket_1.HUDState.get(hudDir, true);
    const data = hudData?.[section]?.[asset];
    const panel = isDev ? socket_1.HUDState?.devHUD?.panel || [] : (await (0, exports.getHUDPanelSetting)(hudDir));
    if (!data) {
        return res.sendStatus(404);
    }
    if (isJSON(data)) {
        return res.json(data);
    }
    if (!panel || !Array.isArray(panel)) {
        return res.send(data);
    }
    const sectionEntry = panel.find(sectionData => sectionData.name === section);
    if (!sectionEntry) {
        return res.send(data);
    }
    const inputEntry = sectionEntry.inputs.find(inputData => inputData.name === asset);
    if (!inputEntry || inputEntry.type !== 'image') {
        return res.send(data);
    }
    const imgBuffer = Buffer.from(data, 'base64');
    res.writeHead(200, {
        'Content-Type': (0, isSvg_1.default)(imgBuffer) ? 'image/svg+xml' : 'image/png',
        'Content-Length': imgBuffer.length
    });
    return res.end(imgBuffer);
};
exports.getHUDCustomAsset = getHUDCustomAsset;
const getHUDARSettings = (dirName) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', dirName);
    const arFileDir = path.join(dir, 'ar.json');
    if (!fs.existsSync(arFileDir)) {
        return null;
    }
    try {
        const arFile = fs.readFileSync(arFileDir, { encoding: 'utf8' });
        const ar = JSON.parse(arFile);
        return ar;
    }
    catch (e) {
        return null;
    }
};
exports.getHUDARSettings = getHUDARSettings;
const getHUDPublicKey = (dirName) => {
    const dir = dirName === 'premiumhud'
        ? path.join(electron_1.app.getPath('userData'), 'premium', 'csgo')
        : path.join(electron_1.app.getPath('home'), 'HUDs', dirName);
    const keyFile = path.join(dir, 'key');
    if (!fs.existsSync(keyFile)) {
        return null;
    }
    try {
        const key = fs.readFileSync(keyFile, 'utf8');
        return key;
    }
    catch (e) {
        return null;
    }
};
const getHUDData = async (dirName, isPremium) => {
    const globalConfig = await (0, config_1.loadConfig)();
    if (!globalConfig)
        return null;
    if (isPremium) {
        return {
            name: 'CS:GO Premium HUD',
            version: '1.0.0',
            author: 'Lexogrine',
            legacy: false,
            dir: 'premiumhud',
            radar: true,
            game: 'csgo',
            publicKey: getHUDPublicKey(dirName),
            killfeed: true,
            keybinds: [
                {
                    bind: 'Alt+S',
                    action: 'setScoreboard'
                },
                {
                    bind: 'Alt+Y',
                    action: 'toggleCameraBoard'
                },
                {
                    bind: 'Alt+W',
                    action: 'setFunGraph'
                },
                {
                    bind: 'Alt+C',
                    action: 'toggleCams'
                },
                {
                    bind: 'Alt+T',
                    action: [
                        {
                            map: 'de_vertigo',
                            action: {
                                action: 'toggleMainScoreboard',
                                exec: 'spec_mode 5;spec_mode 6;spec_goto 41.3 -524.8 12397.0 -0.1 153.8; spec_lerpto -24.1 335.8 12391.3 -4.0 -149.9 12 12'
                            }
                        },
                        {
                            map: 'de_mirage',
                            action: {
                                action: 'toggleMainScoreboard',
                                exec: 'spec_mode 5;spec_mode 6;spec_goto -731.6 -734.9 129.5 7.2 60.7; spec_lerpto -42.5 -655.3 146.7 4.0 119.3 12 12'
                            }
                        },
                        {
                            map: 'de_inferno',
                            action: {
                                action: 'toggleMainScoreboard',
                                exec: 'spec_mode 5;spec_mode 6;spec_goto -1563.1 -179.4 302.1 9.8 134.7; spec_lerpto -1573.8 536.6 248.3 6.1 -157.5 12 12'
                            }
                        },
                        {
                            map: 'de_dust2',
                            action: {
                                action: 'toggleMainScoreboard',
                                exec: 'spec_mode 5;spec_mode 6;spec_goto 373.8 203.8 154.8 -17.6 -25.3; spec_lerpto 422.6 -315.0 106.0 -31.1 16.7 12 12'
                            }
                        },
                        {
                            map: 'de_overpass',
                            action: {
                                action: 'toggleMainScoreboard',
                                exec: 'spec_mode 5;spec_mode 6;spec_goto -781.2 44.4 745.5 15.7 -101.3; spec_lerpto -1541.2 -1030.6 541.9 2.9 -35.8 12 12'
                            }
                        },
                        {
                            map: 'de_nuke',
                            action: {
                                action: 'toggleMainScoreboard',
                                exec: 'spec_mode 5;spec_mode 6;spec_goto 800.0 -2236.4 -170.9 -1.0 -123.3; spec_lerpto -161.2 -2584.0 -127.2 -0.1 -60.4 12 12'
                            }
                        },
                        {
                            map: 'de_ancient',
                            action: {
                                action: 'toggleMainScoreboard',
                                exec: 'spec_mode 5;spec_mode 6;spec_goto -813.4 -38.8 547.7 8.7 -21.2; spec_lerpto -723.9 -748.6 385.0 -14.3 17.4 12 12'
                            }
                        }
                    ]
                }
            ],
            url: `http://${config_1.internalIP}:${globalConfig.port}/hud/premiumhud/`,
            status: 'SYNCED',
            uuid: 'premium-turbo-hud1.0.0.',
            isDev: false
        };
    }
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', dirName);
    const configFileDir = path.join(dir, 'hud.json');
    if (!fs.existsSync(configFileDir)) {
        if (!socket_1.HUDState.devHUD)
            return null;
        if (socket_1.HUDState.devHUD.dir === dirName) {
            return socket_1.HUDState.devHUD;
        }
        return null;
    }
    try {
        let configFile = fs.readFileSync(configFileDir, { encoding: 'utf8' });
        const publicKey = getHUDPublicKey(dirName);
        if (publicKey) {
            const content = jsonwebtoken_1.default.verify(configFile, publicKey, { algorithms: ['RS256'] });
            if (typeof content !== 'string' && !content.name && !content.version)
                return null;
            configFile = content;
        }
        const config = typeof configFile === 'string' ? JSON.parse(configFile) : configFile;
        config.dir = dirName;
        config.game = config.game || 'csgo';
        config.publicKey = getHUDPublicKey(dirName);
        const panel = (0, exports.getHUDPanelSetting)(dirName);
        const keybinds = (0, exports.getHUDKeyBinds)(dirName);
        const ar = (0, exports.getHUDARSettings)(dirName);
        try {
            config.uuid = verifyUniqueID(dirName);
        }
        catch {
            return null;
        }
        if (panel) {
            config.panel = panel;
        }
        if (keybinds) {
            config.keybinds = keybinds;
        }
        if (ar) {
            config.ar = ar;
        }
        config.url = `http://${config_1.internalIP}:${globalConfig.port}/hud/${dirName}/`;
        config.isDev = false;
        return config;
    }
    catch (e) {
        console.log(e);
        return null;
    }
};
exports.getHUDData = getHUDData;
const getHUDKeyBinds = (dirName) => {
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
exports.getHUDKeyBinds = getHUDKeyBinds;
const getHUDPanelSetting = (dirName) => {
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
exports.getHUDPanelSetting = getHUDPanelSetting;
const openHUDsDirectory = async (_req, res) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs');
    electron_1.shell.openPath(dir);
    return res.sendStatus(200);
};
exports.openHUDsDirectory = openHUDsDirectory;
const renderHUD = async (req, res, next) => {
    const cfg = await (0, config_1.loadConfig)();
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
    const data = await (0, exports.getHUDData)(req.params.dir, req.params.dir === 'premiumhud');
    if (!data) {
        return res.sendStatus(404);
    }
    if (data.legacy) {
        return (0, exports.renderLegacy)(req, res, next);
    }
    return (0, exports.render)(req, res, next);
};
exports.renderHUD = renderHUD;
const verifyOverlay = async (req, res, next) => {
    const cfg = await (0, config_1.loadConfig)();
    if (!cfg) {
        return res.sendStatus(500);
    }
    const requestUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const availableUrls = [
        `http://${config_1.internalIP}:${cfg.port}/dev`,
        `http://${config_1.publicIP}:${cfg.port}/dev`,
        `http://localhost:${cfg.port}/dev`
    ];
    if (requestUrl.startsWith(`http://localhost:${cfg.port}/dev/ar/`) ||
        availableUrls.find(url => requestUrl.startsWith(`${url}/ar/`))) {
        return next();
    }
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
exports.verifyOverlay = verifyOverlay;
const render = (req, res) => {
    const dir = req.params.dir === 'premiumhud'
        ? path.join(electron_1.app.getPath('userData'), 'premium', 'csgo')
        : path.join(electron_1.app.getPath('home'), 'HUDs', req.params.dir);
    return res.sendFile(path.join(dir, 'index.html'));
};
exports.render = render;
const renderOverlay = (devHUD = false) => async (req, res) => {
    const cfg = await (0, config_1.loadConfig)();
    if (!cfg) {
        return res.sendStatus(500);
    }
    if (!devHUD) {
        return res.send((0, overlay_1.default)(`/huds/${req.params.dir}/?port=${cfg.port}&isProd=true`));
    }
    return res.send((0, overlay_1.default)(`/dev/?port=${cfg.port}`));
};
exports.renderOverlay = renderOverlay;
const renderThumbnail = (req, res) => {
    return res.sendFile((0, exports.getThumbPath)(req.params.dir));
};
exports.renderThumbnail = renderThumbnail;
const getThumbPath = (dir) => {
    const thumbPath = dir === 'premiumhud'
        ? path.join(electron_1.app.getPath('userData'), 'premium', 'csgo', 'thumb.png')
        : path.join(electron_1.app.getPath('home'), 'HUDs', dir, 'thumb.png');
    if (fs.existsSync(thumbPath)) {
        return thumbPath;
    }
    return path.join(__dirname, '../../assets/icon.png');
};
exports.getThumbPath = getThumbPath;
const renderAssets = async (req, res, next) => {
    if (!req.params.dir) {
        return res.sendStatus(404);
    }
    const data = await (0, exports.getHUDData)(req.params.dir, req.params.dir === 'premiumhud');
    if (!data) {
        return res.sendStatus(404);
    }
    const filePath = req.params.dir === 'premiumhud'
        ? path.join(electron_1.app.getPath('userData'), 'premium', 'csgo', req.path)
        : path.join(electron_1.app.getPath('home'), 'HUDs', data.dir, req.path);
    const staticUrl = req.params.dir === 'premiumhud'
        ? path.join(electron_1.app.getPath('userData'), 'premium', 'csgo')
        : path.join(electron_1.app.getPath('home'), 'HUDs', req.params.dir);
    if ((!req.path.endsWith('.js') && !req.path.endsWith('.css')) || !data.publicKey || !fs.existsSync(filePath)) {
        return express_1.default.static(staticUrl)(req, res, next);
    }
    try {
        const signedFileContent = fs.readFileSync(filePath, 'utf8');
        const content = jsonwebtoken_1.default.verify(signedFileContent, data.publicKey, { algorithms: ['RS256'] });
        if (typeof content !== 'string')
            return res.sendStatus(404);
        res.setHeader('Content-Type', req.path.endsWith('.js') ? 'application/javascript' : 'text/css');
        return res.send(content);
    }
    catch {
        return res.sendStatus(404);
    }
};
exports.renderAssets = renderAssets;
const renderLegacy = async (req, res) => {
    const cfg = await (0, config_1.loadConfig)();
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
exports.renderLegacy = renderLegacy;
const legacyJS = (req, res) => {
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
exports.legacyJS = legacyJS;
const legacyCSS = (req, res) => {
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
exports.legacyCSS = legacyCSS;
const showHUD = async (req, res) => {
    const response = await huds_1.default.open(req.params.hudDir);
    if (response) {
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
};
exports.showHUD = showHUD;
const closeHUD = async (req, res) => {
    const response = await huds_1.default.close();
    if (response) {
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
};
exports.closeHUD = closeHUD;
const sendHUD = async (req, res) => {
    if (!req.body.hud || !req.body.name)
        return res.sendStatus(422);
    const response = await loadHUD(req.body.hud, req.body.name);
    if (response) {
        const notification = new electron_1.Notification({
            title: 'HUD Upload',
            body: `${response.name} uploaded successfully`,
            icon: (0, exports.getThumbPath)(response.dir)
        });
        notification.show();
    }
    return res.sendStatus(response ? 200 : 500);
};
exports.sendHUD = sendHUD;
const deleteHUD = async (req, res) => {
    const io = await socket_1.ioPromise;
    if (!req.query.hudDir || typeof req.query.hudDir !== 'string' || huds_1.default.current)
        return res.sendStatus(422);
    const hudPath = path.join(electron_1.app.getPath('home'), 'HUDs', req.query.hudDir);
    if (!fs.existsSync(hudPath)) {
        return res.sendStatus(200);
    }
    try {
        (0, exports.remove)(hudPath);
        io.emit('reloadHUDs');
        return res.sendStatus(200);
    }
    catch {
        return res.sendStatus(500);
    }
};
exports.deleteHUD = deleteHUD;
const sendActionByHTTP = async (req, res) => {
    const io = await socket_1.ioPromise;
    let { hudDir } = req.params;
    const { action } = req.params;
    const data = req.body;
    if (hudDir === 'development' && 'isDev' in req.query && socket_1.HUDState.devHUD?.dir) {
        hudDir = socket_1.HUDState.devHUD.dir;
    }
    if (data) {
        io.to(hudDir).emit('hud_action', { data, action });
    }
    else {
        io.to(hudDir).emit('keybindAction', action);
    }
    return res.sendStatus(200);
};
exports.sendActionByHTTP = sendActionByHTTP;
const removeArchives = () => {
    const files = fs
        .readdirSync('./')
        .filter(file => (file.startsWith('hud_temp_') || file.startsWith('ar_temp_')) && file.endsWith('.zip'));
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
};
exports.removeArchives = removeArchives;
async function loadHUD(base64, name, existingUUID) {
    (0, exports.removeArchives)();
    return new Promise(res => {
        let hudDirName = name.replace(/[^a-zA-Z0-9-_]/g, '');
        let hudPath = path.join(electron_1.app.getPath('home'), 'HUDs', hudDirName);
        if (fs.existsSync(hudPath)) {
            hudDirName = `${hudDirName}-${(0, exports.getRandomString)()}`;
            hudPath = path.join(electron_1.app.getPath('home'), 'HUDs', hudDirName);
        }
        try {
            const fileString = base64.split(';base64,').pop();
            if (!fileString) {
                throw new Error();
            }
            const tempArchiveName = `./hud_temp_archive_${(0, exports.getRandomString)()}.zip`;
            fs.writeFileSync(tempArchiveName, fileString, { encoding: 'base64', mode: 777 });
            const tempUnzipper = new DecompressZip(tempArchiveName);
            tempUnzipper.on('extract', async () => {
                if (fs.existsSync(path.join(hudPath, 'hud.json'))) {
                    const hudData = await (0, exports.getHUDData)(path.basename(hudPath));
                    if (!hudData || !hudData.name) {
                        throw new Error();
                    }
                    (0, exports.removeArchives)();
                    fs.writeFileSync(path.join(hudPath, 'uuid.lhm'), existingUUID || (0, v4_1.default)(), 'utf8');
                    res(hudData);
                }
                else {
                    if (fs.existsSync(hudPath)) {
                        (0, exports.remove)(hudPath);
                    }
                    (0, exports.removeArchives)();
                    res(null);
                }
            });
            tempUnzipper.on('error', () => {
                if (fs.existsSync(hudPath)) {
                    (0, exports.remove)(hudPath);
                }
                (0, exports.removeArchives)();
                res(null);
            });
            tempUnzipper.extract({
                path: hudPath
            });
            /**/
        }
        catch {
            if (fs.existsSync(hudPath)) {
                (0, exports.remove)(hudPath);
            }
            (0, exports.removeArchives)();
            res(null);
        }
    });
}
// const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const downloadHUD = async (req, res) => {
    const uuid = req.params.uuid;
    if (!_1.customer.game || !uuid)
        return res.sendStatus(422);
    let fileUrl = `storage/file/${_1.customer.game}/hud/${uuid}`;
    if (_1.customer.customer && _1.customer.workspace) {
        fileUrl += `?&teamId=${_1.customer.workspace.id}`;
    }
    const hudData = ((await (0, user_1.api)(fileUrl)) || null);
    const name = hudData?.data?.extra?.name;
    if (!name) {
        return res.sendStatus(404);
    }
    let presignedUrl = `storage/file/url/${_1.customer.game}/GET/${uuid}`;
    if (_1.customer.customer && _1.customer.workspace) {
        presignedUrl += `?&teamId=${_1.customer.workspace.id}`;
    }
    const presignedURLResponse = (await (0, user_1.api)(presignedUrl));
    if (!presignedURLResponse || !presignedURLResponse.url) {
        return res.sendStatus(404);
    }
    const response = await (0, node_fetch_1.default)(presignedURLResponse.url);
    if (!response.ok) {
        return res.sendStatus(404);
    }
    const buffer = await response.buffer();
    const hudBufferString = buffer.toString('base64');
    const result = await loadHUD(hudBufferString, name, uuid);
    return res.json({ result });
};
exports.downloadHUD = downloadHUD;
const deleteHUDFromCloud = async (req, res) => {
    const uuid = req.params.uuid;
    if (!_1.customer.game || !uuid)
        return res.sendStatus(422);
    const io = await socket_1.ioPromise;
    let url = `storage/file/${_1.customer.game}/hud/${uuid}`;
    if (_1.customer.customer && _1.customer.workspace) {
        url += `?&teamId=${_1.customer.workspace.id}`;
    }
    const response = (await (0, user_1.api)(url, 'DELETE'));
    if (response.success) {
        io.emit('reloadHUDs');
    }
    return res.json(response);
};
exports.deleteHUDFromCloud = deleteHUDFromCloud;
const archiveHUD = (hudDir) => new Promise((res, rej) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', hudDir);
    const fileName = `${(0, v4_1.default)()}.zip`;
    const archive = (0, archiver_1.default)('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    const outputFilePath = path.join(electron_1.app.getPath('home'), 'HUDs', fileName);
    const output = fs.createWriteStream(outputFilePath);
    output.on('close', () => res(outputFilePath));
    archive.pipe(output);
    archive.directory(dir, false);
    archive.finalize();
});
const uploadHUD = async (req, res) => {
    const hudDir = req.params.hudDir;
    if (!_1.customer.game || !hudDir)
        return res.sendStatus(422);
    const hud = await (0, exports.getHUDData)(hudDir);
    if (!hud || !hud.uuid || hud.game === 'all')
        return res.sendStatus(422);
    let presignedUrl = `storage/file/url/${_1.customer.game}/PUT/${hud.uuid}`;
    if (_1.customer.customer && _1.customer.workspace) {
        presignedUrl += `?&teamId=${_1.customer.workspace.id}`;
    }
    const presignedURLResponse = (await (0, user_1.api)(presignedUrl));
    if (!presignedURLResponse || !presignedURLResponse.url) {
        return res.sendStatus(404);
    }
    let uploadUrl = `storage/file/${_1.customer.game}/hud/${hud.uuid}`;
    if (_1.customer.customer && _1.customer.workspace) {
        uploadUrl += `?&teamId=${_1.customer.workspace.id}`;
    }
    const hudUploadResponse = await (0, user_1.api)(uploadUrl, 'POST', {
        extra: hud
    });
    if (!hudUploadResponse || !hudUploadResponse.result) {
        return res.sendStatus(404);
    }
    const archivePath = await archiveHUD(hudDir);
    const payload = fs.createReadStream(archivePath);
    const response = await (0, node_fetch_1.default)(presignedURLResponse.url, {
        method: 'PUT',
        body: payload,
        headers: {
            'Content-Length': `${fs.statSync(archivePath).size}`
        }
    });
    if (!response.ok) {
        fs.unlinkSync(archivePath);
        return res.sendStatus(404);
    }
    fs.unlinkSync(archivePath);
    return res.json({ hudUploadResponse });
};
exports.uploadHUD = uploadHUD;
const getAllFilesToSign = (hudDir) => {
    const files = [];
    const getFiles = (dir) => {
        fs.readdirSync(dir).forEach(file => {
            const fileDirectory = path.join(dir, file);
            if (fs.statSync(fileDirectory).isDirectory())
                return getFiles(fileDirectory);
            else if (fileDirectory.endsWith('.js'))
                return files.push(fileDirectory);
        });
    };
    getFiles(hudDir);
    return files;
};
const signHUD = async (hudDir) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', hudDir);
    const keyFile = path.join(dir, 'key');
    if (fs.existsSync(keyFile)) {
        return true;
    }
    const filesToSign = getAllFilesToSign(dir);
    filesToSign.push(path.join(dir, 'hud.json'));
    const keys = crypto_1.default.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'top secret'
        }
    });
    let success = true;
    const fileToContent = {};
    filesToSign.forEach(file => {
        if (!success) {
            return;
        }
        const content = fs.readFileSync(file, 'utf8');
        try {
            const signed = jsonwebtoken_1.default.sign(content, { key: keys.privateKey.toString(), passphrase: 'top secret' }, { algorithm: 'RS256' });
            fileToContent[file] = signed;
        }
        catch {
            success = false;
        }
    });
    if (!success)
        return false;
    filesToSign.forEach(file => {
        fs.writeFileSync(file, fileToContent[file]);
    });
    fs.writeFileSync(keyFile, keys.publicKey.toString());
    return success;
};
exports.signHUD = signHUD;
const singHUDByDir = async (_req, res) => {
    /*const hudDir = req.params.hudDir;
    const result = await signHUD(hudDir);
    return res.json({ result });*/
    return res.sendStatus(200);
};
exports.singHUDByDir = singHUDByDir;
(0, exports.listHUDs)().then(huds => huds.filter(hud => !!hud.dir).map(hud => verifyUniqueID(hud.dir)));
