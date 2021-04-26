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

exports.deleteHUD = exports.sendHUD = exports.closeHUD = exports.showHUD = exports.legacyCSS = exports.legacyJS = exports.renderLegacy = exports.renderAssets = exports.getThumbPath = exports.renderThumbnail = exports.renderOverlay = exports.render = exports.verifyOverlay = exports.renderHUD = exports.openHUDsDirectory = exports.getHUDPanelSetting = exports.getHUDKeyBinds = exports.getHUDData = exports.getHUDARSettings = exports.getHUDs = exports.listHUDs = void 0;

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
const DecompressZip = require('decompress-zip');
const getRandomString = () => (Math.random() * 1000 + 1)
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 15);
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
const verifyUniqueID = (hudDir) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', hudDir, 'uuid.lhm');
    if (fs.existsSync(dir)) {
        return fs.readFileSync(dir, 'utf8');
    }
    const uuid = v4_1.default();
    fs.writeFileSync(dir, uuid, 'utf8');
    return uuid;
};
const getOnlineHUDs = async () => {
    if (!_1.customer.game)
        return [];
    try {
        const onlineHUDData = ((await user_1.api(`storage/file/${_1.customer.game}`)) || []);
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
exports.listHUDs = async () => {
    if (!_1.customer || !_1.customer.game)
        return [];
    const onlineHUDs = await getOnlineHUDs();
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs');
    const filtered = fs
        .readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .filter(dirent => /^[0-9a-zA-Z-_]+$/g.test(dirent.name));
    const huds = (await Promise.all(filtered.map(async (dirent) => await exports.getHUDData(dirent.name)))).filter(hud => hud !== null);
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
    return huds.map(mapHUDStatus).filter(hud => _1.customer.game === hud.game || (_1.customer.game === 'csgo' && !hud.game));
};
exports.getHUDs = async (req, res) => {
    return res.json(await exports.listHUDs());
};
exports.getHUDARSettings = (dirName) => {
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
        config.game = config.game || 'csgo';
        const panel = exports.getHUDPanelSetting(dirName);
        const keybinds = exports.getHUDKeyBinds(dirName);

        const ar = exports.getHUDARSettings(dirName);

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
exports.sendHUD = async (req, res) => {
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
async function loadHUD(base64, name, existingUUID) {
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
                    fs.writeFileSync(path.join(hudPath, 'uuid.lhm'), existingUUID || v4_1.default(), 'utf8');
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
// const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
exports.downloadHUD = async (req, res) => {
    const uuid = req.params.uuid;
    if (!_1.customer.game || !uuid)
        return res.sendStatus(422);
    const hudData = ((await user_1.api(`storage/file/${_1.customer.game}/hud/${uuid}`)) || null);
    const name = hudData?.data?.extra?.name;
    if (hudData?.data?.data?.type !== 'Buffer' || !name)
        return res.sendStatus(422);
    const data = hudData.data.data;
    if (typeof data === 'number')
        return res.sendStatus(422);
    const hudBufferString = Buffer.from(data).toString('base64');
    const result = await loadHUD(hudBufferString, name, uuid);
    return res.json({ result });
};
const archiveHUD = (hudDir) => new Promise((res, rej) => {
    const dir = path.join(electron_1.app.getPath('home'), 'HUDs', hudDir);
    const fileName = `${v4_1.default()}.zip`;
    const archive = archiver_1.default('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    const outputFilePath = path.join(electron_1.app.getPath('home'), 'HUDs', fileName);
    const output = fs.createWriteStream(outputFilePath);
    output.on('close', () => res(outputFilePath));
    archive.pipe(output);
    archive.directory(dir, false);
    archive.finalize();
});
exports.uploadHUD = async (req, res) => {
    const hudDir = req.params.hudDir;
    if (!_1.customer.game || !hudDir)
        return res.sendStatus(422);
    const hud = await exports.getHUDData(hudDir);
    if (!hud || !hud.uuid)
        return res.sendStatus(422);
    const archivePath = await archiveHUD(hudDir);
    const archiveBase64 = fs.readFileSync(archivePath, 'base64');
    const hudUploadResponse = await user_1.api(`storage/file/${_1.customer.game}/hud/${hud.uuid}`, 'POST', {
        file: archiveBase64,
        extra: hud
    });
    fs.unlinkSync(archivePath);
    return res.json({ hudUploadResponse });
};
exports.listHUDs().then(huds => huds.filter(hud => !!hud.dir).map(hud => verifyUniqueID(hud.dir)));
