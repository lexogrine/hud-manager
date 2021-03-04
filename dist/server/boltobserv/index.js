"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const __1 = require("..");
const huds_1 = require("../api/huds");
const customRadarCSS = async (req, res) => {
    const sendDefault = () => res.sendFile(path_1.default.join(__dirname, '../boltobserv', 'css', `custom.css`));
    if (!req.query.hud || typeof req.query.hud !== 'string') {
        return sendDefault();
    }
    const hud = await huds_1.getHUDData(req.query.hud);
    if (!hud?.boltobserv?.css)
        return sendDefault();
    const dir = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
    return res.sendFile(path_1.default.join(dir, 'radar.css'));
};
__1.app.get('/boltobserv/css/custom.css', customRadarCSS);
__1.app.get('/huds/:hud/custom.css', (req, res, next) => {
    req.query.hud = req.params.hud;
    return customRadarCSS(req, res, next);
});
__1.app.get('/boltobserv/maps/:mapName/meta.json5', async (req, res) => {
    const sendDefault = () => res.sendFile(path_1.default.join(__dirname, '../boltobserv', 'maps', req.params.mapName, 'meta.json5'));
    if (!req.params.mapName) {
        return res.sendStatus(404);
    }
    if (req.query.dev === 'true') {
        try {
            const result = await fetch(`http://localhost:3500/maps/${req.params.mapName}/meta.json5`, {});
            return res.send(await result.text());
        }
        catch {
            return sendDefault();
        }
    }
    if (!req.query.hud || typeof req.query.hud !== 'string')
        return sendDefault();
    const hud = await huds_1.getHUDData(req.query.hud);
    if (!hud?.boltobserv?.maps)
        return sendDefault();
    const dir = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
    const pathFile = path_1.default.join(dir, 'maps', req.params.mapName, 'meta.json5');
    if (!fs_1.default.existsSync(pathFile))
        return sendDefault();
    return res.sendFile(pathFile);
});
__1.app.get('/boltobserv/maps/:mapName/radar.png', async (req, res) => {
    const sendDefault = () => res.sendFile(path_1.default.join(__dirname, '../boltobserv', 'maps', req.params.mapName, 'radar.png'));
    if (!req.params.mapName) {
        return res.sendStatus(404);
    }
    if (!req.query.hud || typeof req.query.hud !== 'string')
        return sendDefault();
    const hud = await huds_1.getHUDData(req.query.hud);
    if (!hud?.boltobserv?.maps)
        return sendDefault();
    const dir = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
    const pathFile = path_1.default.join(dir, 'maps', req.params.mapName, 'radar.png');
    if (!fs_1.default.existsSync(pathFile))
        return sendDefault();
    return res.sendFile(pathFile);
});
