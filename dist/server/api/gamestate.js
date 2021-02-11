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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfgsZIPBase64 = exports.saveFile = exports.createGSIFile = exports.generateGSIFile = exports.checkGSIFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const VDF = __importStar(require("@node-steam/vdf"));
const steam_game_path_1 = require("steam-game-path");
const config_1 = require("./config");
const electron_1 = require("electron");
const csgogsi_generator_1 = __importDefault(require("csgogsi-generator"));
const GSITemplate = csgogsi_generator_1.default('HUDMANAGERGSI', 'http://localhost:1349/').json;
exports.checkGSIFile = async (req, res) => {
    const config = await config_1.loadConfig();
    let GamePath;
    try {
        GamePath = steam_game_path_1.getGamePath(730);
    }
    catch {
        return res.json({ success: false, message: "Game path couldn't be found", accessible: false });
    }
    if (!config || !GamePath || !GamePath.game || !GamePath.game.path) {
        return res.json({ success: false, message: "Game path couldn't be found", accessible: false });
    }
    const cfgPath = path_1.default.join(GamePath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
    if (!fs_1.default.existsSync(cfgPath)) {
        return res.json({ success: false, message: "File couldn't be found", accessible: true });
    }
    try {
        const rawContent = fs_1.default.readFileSync(cfgPath, 'UTF-8');
        const content = VDF.parse(rawContent)?.HUDMANAGERGSI;
        if (!content) {
            //Corrupted file
            return res.json({ success: false, message: 'File seems to be corrupted', accessible: true });
        }
        if (!content.uri.endsWith(`:${config.port}/`)) {
            // wrong port
            return res.json({ success: false, message: 'Wrong address', accessible: true });
        }
        if (JSON.stringify(GSITemplate.HUDMANAGERGSI.data) !== JSON.stringify(content.data)) {
            // wrong settings
            return res.json({ success: false, message: 'Wrong configuration', accessible: true });
        }
        if (!content.auth && config.token) {
            return res.json({ success: false, message: 'Wrong token', accessible: true });
        }
        if (content.auth && content.auth.token !== config.token) {
            return res.json({ success: false, message: 'Wrong token', accessible: true });
        }
        return res.json({ success: true });
    }
    catch {
        return res.json({ success: false, message: 'Unexpected error occured', accessible: true });
    }
};
exports.generateGSIFile = async () => {
    const config = await config_1.loadConfig();
    const address = `http://localhost:${config.port}/`;
    const text = csgogsi_generator_1.default('HUDMANAGERGSI', address, config.token).vdf;
    return text;
};
exports.createGSIFile = async (req, res) => {
    const text = await exports.generateGSIFile();
    if (!text) {
        return res.sendStatus(422);
    }
    let GamePath;
    try {
        GamePath = steam_game_path_1.getGamePath(730);
    }
    catch {
        return res.json({});
    }
    if (!GamePath || !GamePath.game || !GamePath.game.path) {
        return res.json({});
    }
    const cfgPath = path_1.default.join(GamePath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
    try {
        if (fs_1.default.existsSync(cfgPath)) {
            fs_1.default.unlinkSync(cfgPath);
        }
        fs_1.default.writeFileSync(cfgPath, text, 'UTF-8');
        return res.json({ success: true, message: 'Config file was successfully saved' });
    }
    catch {
        return res.json({ success: false, message: 'Unexpected error occured' });
    }
};
exports.saveFile = (name, content, base64 = false) => async (_req, res) => {
    res.sendStatus(200);
    const result = await electron_1.dialog.showSaveDialog({ defaultPath: name });
    const text = typeof content === 'string' ? content : await content;
    if (result.filePath) {
        fs_1.default.writeFileSync(result.filePath, text, { encoding: base64 ? 'base64' : 'UTF-8' });
    }
};
exports.cfgsZIPBase64 = 'UEsDBBQAAAAIAJOYXE84wXDJWAAAAHQAAAAWAAAAaHVkX3JhZGFyX2tpbGxmZWVkLmNmZ1XKQQqAIBAAwHuvEO8h4iHoM4uoZbC5sa5Jv48giM4zASGy70AFL4jJSy4kW0hV2eG13CIsxCH9fbTDvvEJx4qqMSrd62wMUvCYqcrsrHOTeYr+YhXPcgNQSwMEFAAAAAgAk5hcTyCrGb0xAAAANAAAAAcAAABodWQuY2ZnS86JTylKLI/Pz8upjE9JTSzJyMsvyUxOLVYw5ILKZZSmxKflFyWnxhclpiQWKRgCAFBLAwQUAAAACACTmFxPoMM5S18AAACNAAAAEAAAAGh1ZF9raWxsZmVlZC5jZmdtyzEKgDAMQNHdUxR3KaWD0MuE0FYrRCNpVLy9CIIIzv/9SJAED+CFTkgZtSysU8zVuOZpZUswsMQMggnlL3zGzjXzJDusI5lNyLRHDdYSR6TCVYN33vf2Ju0Lq6LoBVBLAwQUAAAACACTmFxPJlBm3h0AAAAbAAAADQAAAGh1ZF9yYWRhci5jZmdLzolPKUosj8/Py6mMT0lNLMnIyy/JTE4tVjAEAFBLAQIfABQAAAAIAJOYXE84wXDJWAAAAHQAAAAWACQAAAAAAAAAIAAAAAAAAABodWRfcmFkYXJfa2lsbGZlZWQuY2ZnCgAgAAAAAAABABgA9RNKKrqN1QFdZynbBcfVAUpAKdsFx9UBUEsBAh8AFAAAAAgAk5hcTyCrGb0xAAAANAAAAAcAJAAAAAAAAAAgAAAAjAAAAGh1ZC5jZmcKACAAAAAAAAEAGACvXUwquo3VAYS1KdsFx9UBhLUp2wXH1QFQSwECHwAUAAAACACTmFxPoMM5S18AAACNAAAAEAAkAAAAAAAAACAAAADiAAAAaHVkX2tpbGxmZWVkLmNmZwoAIAAAAAAAAQAYAFpzSyq6jdUBfisq2wXH1QGtAyrbBcfVAVBLAQIfABQAAAAIAJOYXE8mUGbeHQAAABsAAAANACQAAAAAAAAAIAAAAG8BAABodWRfcmFkYXIuY2ZnCgAgAAAAAAABABgALddKKrqN1QHxnyrbBcfVAeR4KtsFx9UBUEsFBgAAAAAEAAQAggEAALcBAAAAAA==';
