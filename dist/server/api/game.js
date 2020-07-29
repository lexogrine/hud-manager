"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var steam_game_path_1 = require("steam-game-path");
var config_1 = require("./config");
var sockets_1 = require("../sockets");
var child_process_1 = require("child_process");
var electron_1 = require("../../electron");
function createCFG(customRadar, customKillfeed, afx) {
    var cfg = "cl_draw_only_deathnotices 1";
    var file = 'hud';
    if (!customRadar) {
        cfg += "\ncl_drawhud_force_radar 1";
    }
    else {
        cfg += "\ncl_drawhud_force_radar 0";
        file += '_radar';
    }
    if (customKillfeed) {
        file += '_killfeed';
        cfg += "\ncl_drawhud_force_deathnotices -1";
        cfg += "\nmirv_pgl url \"ws://localhost:31337/mirv\"";
        cfg += "\nmirv_pgl start";
    }
    if (afx) {
        file += '_interop';
        cfg = 'afx_interop connect 1';
        cfg += "\nexec " + createCFG(customRadar, customKillfeed, false).file;
    }
    file += '.cfg';
    return { cfg: cfg, file: file };
}
function exists(file) {
    try {
        return fs_1["default"].existsSync(file);
    }
    catch (_a) {
        return false;
    }
}
function isCorrect(cfg) {
    try {
        var GamePath = steam_game_path_1.getGamePath(730);
        if (!GamePath || !GamePath.game || !GamePath.game.path) {
            return false;
        }
        var file = cfg.file;
        var cfgDir = path_1["default"].join(GamePath.game.path, 'csgo', 'cfg');
        return fs_1["default"].readFileSync(path_1["default"].join(cfgDir, file), 'UTF-8') === cfg.cfg;
    }
    catch (_a) {
        return false;
    }
}
exports.checkCFGs = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, GamePath, _a, switcher, cfgs, files;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                config = _b.sent();
                GamePath = steam_game_path_1.getGamePath(730);
                return [3 /*break*/, 3];
            case 2:
                _a = _b.sent();
                return [2 /*return*/, res.json({ success: false, message: "Game path couldn't be found", accessible: false })];
            case 3:
                if (!config || !GamePath || !GamePath.game || !GamePath.game.path) {
                    return [2 /*return*/, res.json({ success: false, message: "Game path couldn't be found", accessible: false })];
                }
                switcher = [true, false];
                cfgs = [];
                /*const afx_interop_cfg: CFG = {
                    cfg: 'afx_interop connect 1',
                    file: 'hud_interop.cfg'
                }
                cfgs.push(afx_interop_cfg);*/
                switcher.forEach(function (interop) {
                    switcher.forEach(function (radar) {
                        switcher.forEach(function (killfeed) {
                            cfgs.push(createCFG(radar, killfeed, interop));
                        });
                    });
                });
                files = cfgs.map(function (cfg) { return cfg.file; });
                if (!files.map(function (file) { return path_1["default"].join(GamePath.game.path, 'csgo', 'cfg', file); }).every(exists)) {
                    return [2 /*return*/, res.json({ success: false, message: 'Files are missing', accessible: true })];
                }
                if (!cfgs.every(isCorrect)) {
                    return [2 /*return*/, res.json({ success: false, message: 'CFGs is incorrect', accessible: true })];
                }
                return [2 /*return*/, res.json({ success: true })];
        }
    });
}); };
exports.createCFGs = function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var GamePath, cfgDir, switcher_1, cfgs_2, _i, cfgs_1, cfg, cfgPath;
    return __generator(this, function (_a) {
        try {
            GamePath = steam_game_path_1.getGamePath(730);
        }
        catch (_b) {
            return [2 /*return*/, res.json({ success: false, message: 'Unexpected error occured' })];
        }
        if (!GamePath || !GamePath.game || !GamePath.game.path) {
            return [2 /*return*/, res.json({ success: false, message: 'Unexpected error occured' })];
        }
        cfgDir = path_1["default"].join(GamePath.game.path, 'csgo', 'cfg');
        try {
            switcher_1 = [true, false];
            cfgs_2 = [];
            /*const afx_interop_cfg: CFG = {
                cfg: 'afx_interop connect 1',
                file: 'hud_interop.cfg'
            }
            cfgs.push(afx_interop_cfg);*/
            switcher_1.forEach(function (interop) {
                switcher_1.forEach(function (radar) {
                    switcher_1.forEach(function (killfeed) {
                        cfgs_2.push(createCFG(radar, killfeed, interop));
                    });
                });
            });
            for (_i = 0, cfgs_1 = cfgs_2; _i < cfgs_1.length; _i++) {
                cfg = cfgs_1[_i];
                cfgPath = path_1["default"].join(cfgDir, cfg.file);
                if (fs_1["default"].existsSync(cfgPath)) {
                    fs_1["default"].unlinkSync(cfgPath);
                }
                fs_1["default"].writeFileSync(cfgPath, cfg.cfg, 'UTF-8');
            }
            return [2 /*return*/, res.json({ success: true, message: 'Configs were successfully saved' })];
        }
        catch (_c) {
            return [2 /*return*/, res.json({ success: false, message: 'Unexpected error occured' })];
        }
        return [2 /*return*/];
    });
}); };
exports.getLatestData = function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, res.json(sockets_1.GSI.last || {})];
    });
}); };
exports.getSteamPath = function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var GamePath;
    return __generator(this, function (_a) {
        try {
            GamePath = steam_game_path_1.getGamePath(730);
            if (!GamePath || !GamePath.steam || !GamePath.steam.path) {
                return [2 /*return*/, res.status(404).json({ success: false })];
            }
            return [2 /*return*/, res.json({ success: true, steamPath: path_1["default"].join(GamePath.steam.path, 'Steam.exe') })];
        }
        catch (_b) {
            return [2 /*return*/, res.status(404).json({ success: false })];
        }
        return [2 /*return*/];
    });
}); };
exports.run = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, exec, GamePath, HLAEPath, GameExePath, isHLAE, exePath, args, steam;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                config = _a.sent();
                if (!config) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                exec = '';
                if (req.query.config && typeof req.query.config === "string") {
                    exec = "+exec " + req.query.config;
                }
                try {
                    GamePath = steam_game_path_1.getGamePath(730);
                }
                catch (_b) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                if (!GamePath || !GamePath.steam || !GamePath.steam.path || !GamePath.game || !GamePath.game.path) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                HLAEPath = config.hlaePath;
                GameExePath = path_1["default"].join(GamePath.game.path, 'csgo.exe');
                isHLAE = exec.includes("killfeed");
                exePath = isHLAE ? HLAEPath : path_1["default"].join(GamePath.steam.path, "Steam.exe");
                if (isHLAE && (!HLAEPath || !fs_1["default"].existsSync(HLAEPath))) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                args = [];
                if (!isHLAE) {
                    args.push('-applaunch 730');
                    if (exec) {
                        args.push(exec);
                    }
                }
                else {
                    args.push('-csgoLauncher', '-noGui', '-autoStart', "-csgoExe \"" + GameExePath + "\"");
                    if (exec) {
                        args.push("-customLaunchOptions \"" + exec + "\"");
                    }
                }
                try {
                    steam = child_process_1.spawn("\"" + exePath + "\"", args, { detached: true, shell: true, stdio: 'ignore' });
                    steam.unref();
                }
                catch (e) {
                    return [2 /*return*/, res.sendStatus(500)];
                }
                return [2 /*return*/, res.sendStatus(200)];
        }
    });
}); };
exports.runExperimental = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, GamePath, HLAEPath, GameExePath, exePath, args, url, exec, steam, process_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                config = _a.sent();
                if (!config) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                try {
                    GamePath = steam_game_path_1.getGamePath(730);
                }
                catch (_b) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                if (!GamePath || !GamePath.steam || !GamePath.steam.path || !GamePath.game || !GamePath.game.path) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                HLAEPath = config.hlaePath;
                GameExePath = path_1["default"].join(GamePath.game.path, 'csgo.exe');
                exePath = HLAEPath;
                if (!HLAEPath || !fs_1["default"].existsSync(HLAEPath) || !config.afxCEFHudInteropPath || !fs_1["default"].existsSync(config.afxCEFHudInteropPath)) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                args = [];
                url = "http://localhost:" + config.port + "/hlae.html";
                exec = '';
                if (req.query.config && typeof req.query.config === "string") {
                    exec = "+exec " + req.query.config;
                }
                args.push('-csgoLauncher', '-noGui', '-autoStart', "-csgoExe \"" + GameExePath + "\"", '-gfxFull false');
                if (exec) {
                    args.push("-customLaunchOptions \"-afxInteropLight " + exec + "\"");
                }
                else {
                    args.push("-customLaunchOptions \"-afxInteropLight\"");
                }
                try {
                    steam = child_process_1.spawn("\"" + exePath + "\"", args, { detached: true, shell: true, stdio: 'ignore' });
                    steam.unref();
                    if (!electron_1.AFXInterop.process) {
                        process_1 = child_process_1.spawn("" + config.afxCEFHudInteropPath, ["--url=" + url], { stdio: 'ignore' });
                        electron_1.AFXInterop.process = process_1;
                    }
                }
                catch (e) {
                    return [2 /*return*/, res.sendStatus(500)];
                }
                return [2 /*return*/, res.sendStatus(200)];
        }
    });
}); };
