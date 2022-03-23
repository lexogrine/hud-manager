"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDota2 = exports.run = exports.getSteamPath = exports.getLatestData = exports.createCFGs = exports.checkCFGs = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const steam_game_path_1 = require("steam-game-path");
const config_1 = require("./config");
const socket_1 = require("../socket");
const child_process_1 = require("child_process");
const electron_1 = require("../../electron");
const integration_1 = require("../hlae/integration");
function createCFG(customRadar, customKillfeed, afx, port, aco, autoexec = true) {
    let cfg = `cl_draw_only_deathnotices 1`;
    let file = 'hud';
    if (!customRadar) {
        cfg += `\ncl_drawhud_force_radar 1`;
    }
    else {
        cfg += `\ncl_drawhud_force_radar 0`;
        file += '_radar';
    }
    if (customKillfeed) {
        file += '_killfeed';
        cfg += `\ncl_drawhud_force_deathnotices -1`;
    }
    if (customKillfeed || aco) {
        if (aco)
            file += '_aco';
        cfg += `\nmirv_pgl url "ws://localhost:${port}/socket.io/?EIO=3&transport=websocket"`;
        cfg += `\nmirv_pgl start`;
    }
    if (afx) {
        file += '_interop';
        cfg = 'afx_interop connect 1';
        cfg += `\nexec ${createCFG(customRadar, customKillfeed, false, port, aco).file}`;
    }
    file += '.cfg';
    if (!autoexec) {
        file = '';
    }
    return { cfg, file };
}
function exists(file) {
    try {
        return fs_1.default.existsSync(file);
    }
    catch {
        return false;
    }
}
function isCorrect(cfg) {
    try {
        const GamePath = (0, steam_game_path_1.getGamePath)(730);
        if (!GamePath || !GamePath.game || !GamePath.game.path) {
            return false;
        }
        const file = cfg.file;
        const cfgDir = path_1.default.join(GamePath.game.path, 'csgo', 'cfg');
        return fs_1.default.readFileSync(path_1.default.join(cfgDir, file), 'utf-8') === cfg.cfg;
    }
    catch {
        return false;
    }
}
const checkCFGs = async (req, res) => {
    const game = req.query.game;
    const steamGameId = game === 'csgo' ? 730 : 570;
    const config = await (0, config_1.loadConfig)();
    const SteamGamePath = (0, steam_game_path_1.getGamePath)(steamGameId);
    const gamePath = SteamGamePath?.game?.path;
    if (!config || !gamePath) {
        return res.json({ success: false, message: "Game path couldn't be found", accessible: false });
    }
    if (game === 'dota2') {
        return res.json({ success: true });
    }
    const switcher = [true, false];
    const cfgs = [];
    /*const afx_interop_cfg: CFG = {
        cfg: 'afx_interop connect 1',
        file: 'hud_interop.cfg'
    }
    cfgs.push(afx_interop_cfg);*/
    switcher.forEach(interop => {
        switcher.forEach(radar => {
            switcher.forEach(killfeed => {
                switcher.forEach(aco => {
                    cfgs.push(createCFG(radar, killfeed, interop, config.port, aco));
                });
            });
        });
    });
    const files = cfgs.map(cfg => cfg.file);
    if (!files.map(file => path_1.default.join(gamePath, 'csgo', 'cfg', file)).every(exists)) {
        return res.json({ success: false, message: 'Files are missing', accessible: true });
    }
    if (!cfgs.every(isCorrect)) {
        return res.json({ success: false, message: 'CFGs is incorrect', accessible: true });
    }
    return res.json({ success: true });
};
exports.checkCFGs = checkCFGs;
const createCFGs = async (req, res) => {
    const game = req.query.game;
    const steamGameId = game === 'csgo' ? 730 : 570;
    if (game === 'dota2') {
        return res.json({ success: true, message: 'Configs were successfully saved' });
    }
    const config = await (0, config_1.loadConfig)();
    let GamePath;
    try {
        GamePath = (0, steam_game_path_1.getGamePath)(steamGameId);
    }
    catch {
        return res.json({ success: false, message: 'Unexpected error occured' });
    }
    if (!GamePath || !GamePath.game || !GamePath.game.path) {
        return res.json({ success: false, message: 'Unexpected error occured' });
    }
    const cfgDir = path_1.default.join(GamePath.game.path, 'csgo', 'cfg');
    try {
        const switcher = [true, false];
        const cfgs = [];
        /*const afx_interop_cfg: CFG = {
            cfg: 'afx_interop connect 1',
            file: 'hud_interop.cfg'
        }
        cfgs.push(afx_interop_cfg);*/
        switcher.forEach(interop => {
            switcher.forEach(radar => {
                switcher.forEach(killfeed => {
                    switcher.forEach(aco => {
                        cfgs.push(createCFG(radar, killfeed, interop, config.port, aco));
                    });
                });
            });
        });
        for (const cfg of cfgs) {
            const cfgPath = path_1.default.join(cfgDir, cfg.file);
            if (fs_1.default.existsSync(cfgPath)) {
                fs_1.default.unlinkSync(cfgPath);
            }
            fs_1.default.writeFileSync(cfgPath, cfg.cfg, 'utf-8');
        }
        return res.json({ success: true, message: 'Configs were successfully saved' });
    }
    catch {
        return res.json({ success: false, message: 'Unexpected error occured' });
    }
};
exports.createCFGs = createCFGs;
const getLatestData = async (_req, res) => {
    return res.json(socket_1.GSI.last || {});
};
exports.getLatestData = getLatestData;
const getSteamPath = async (_req, res) => {
    try {
        const GamePath = (0, steam_game_path_1.getGamePath)(730);
        if (!GamePath || !GamePath.steam || !GamePath.steam.path) {
            return res.status(404).json({ success: false });
        }
        return res.json({ success: true, steamPath: path_1.default.join(GamePath.steam.path, 'Steam.exe') });
    }
    catch {
        return res.status(404).json({ success: false });
    }
};
exports.getSteamPath = getSteamPath;
const run = async (req, res) => {
    const config = await (0, config_1.loadConfig)();
    if (!config) {
        return res.sendStatus(422);
    }
    const cfgData = req.body;
    const cfg = createCFG(cfgData.radar, cfgData.killfeed, cfgData.afx, config.port, cfgData.autoexec);
    const exec = cfg.file ? `+exec ${cfg.file}` : '';
    let GamePath;
    try {
        GamePath = (0, steam_game_path_1.getGamePath)(730);
    }
    catch {
        return res.sendStatus(404);
    }
    if (!GamePath || !GamePath.steam || !GamePath.steam.path || !GamePath.game || !GamePath.game.path) {
        return res.sendStatus(404);
    }
    const HLAEPath = integration_1.useIntegrated ? integration_1.hlaeExecutable : config.hlaePath;
    const AFXPath = integration_1.useIntegrated ? integration_1.afxExecutable : config.afxCEFHudInteropPath;
    const GameExePath = path_1.default.join(GamePath.game.path, 'csgo.exe');
    const isHLAE = cfgData.killfeed || cfgData.afx;
    const exePath = isHLAE ? HLAEPath : path_1.default.join(GamePath.steam.path, 'Steam.exe');
    if ((isHLAE && (!HLAEPath || !fs_1.default.existsSync(HLAEPath))) || (cfgData.afx && (!AFXPath || !fs_1.default.existsSync(AFXPath)))) {
        return res.sendStatus(404);
    }
    // http://localhost:${config.port}/ar2/examples/default/index.html
    const args = [];
    const afxURL = `http://localhost:${config.port}/ar2/examples/default/index.html`;
    if (!isHLAE) {
        args.push('-applaunch 730');
        if (exec) {
            args.push(exec);
        }
    }
    else {
        args.push('-csgoLauncher', '-noGui', '-autoStart', `-csgoExe "${GameExePath}"`);
        if (cfgData.afx) {
            if (exec) {
                args.push(`-customLaunchOptions "-afxInteropLight ${exec}"`);
            }
            else {
                args.push(`-customLaunchOptions "-afxInteropLight"`);
            }
        }
        else {
            args.push(`-customLaunchOptions "${exec}"`);
        }
    }
    //--enable-experimental-web-platform-features
    try {
        const steam = (0, child_process_1.spawn)(`"${exePath}"`, args, { detached: true, shell: true, stdio: 'ignore' });
        steam.unref();
        if (cfgData.afx && !electron_1.AFXInterop.process) {
            const process = (0, child_process_1.spawn)(`${AFXPath}`, [
                `--url=${afxURL}`,
                '--enable-experimental-web-platform-features',
                '--disable-logging',
                '--afx-no-window',
                '--logging-severity=error'
            ], { stdio: 'ignore' });
            electron_1.AFXInterop.process = process;
        }
    }
    catch (e) {
        return res.sendStatus(500);
    }
    return res.sendStatus(200);
};
exports.run = run;
const runDota2 = async (req, res) => {
    const GamePath = (0, steam_game_path_1.getGamePath)(570);
    if (!GamePath || !GamePath.steam || !GamePath.steam.path || !GamePath.game || !GamePath.game.path) {
        return res.sendStatus(404);
    }
    const exePath = path_1.default.join(GamePath.steam.path, 'Steam.exe');
    try {
        const steam = (0, child_process_1.spawn)(`"${exePath}"`, ['-applaunch 570 -gamestateintegration'], {
            detached: true,
            shell: true,
            stdio: 'ignore'
        });
        steam.unref();
    }
    catch (e) {
        return res.sendStatus(500);
    }
    return res.sendStatus(200);
};
exports.runDota2 = runDota2;
