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
function createCFG(customRadar, customKillfeed) {
    var cfg = "cl_draw_only_deathnotices 1";
    var file = 'hud';
    if (!customRadar) {
        cfg += "\ncl_drawhud_force_radar 1";
    }
    else {
        file += '_radar';
    }
    if (customKillfeed) {
        file += '_killfeed';
        cfg += "\ncl_drawhud_force_deathnotices -1";
        cfg += "\nmirv_pgl url \"ws://localhost:31337/mirv\"";
        cfg += "\nmirv_pgl start";
    }
    file += '.cfg';
    return { cfg: cfg, file: file };
}
function exists(file) {
    var CSGOPath = steam_game_path_1.getGamePath(730);
    if (!CSGOPath || !CSGOPath.game || !CSGOPath.game.path) {
        return false;
    }
    var cfgDir = path_1["default"].join(CSGOPath.game.path, 'csgo', 'cfg');
    return fs_1["default"].existsSync(path_1["default"].join(cfgDir, file));
}
function isCorrect(cfg) {
    var CSGOPath = steam_game_path_1.getGamePath(730);
    if (!CSGOPath || !CSGOPath.game || !CSGOPath.game.path) {
        return false;
    }
    var file = cfg.file;
    var cfgDir = path_1["default"].join(CSGOPath.game.path, 'csgo', 'cfg');
    return fs_1["default"].readFileSync(path_1["default"].join(cfgDir, file), 'UTF-8') === cfg.cfg;
}
exports.checkCFGs = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, CSGOPath, switcher, cfgs, files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                config = _a.sent();
                CSGOPath = steam_game_path_1.getGamePath(730);
                if (!config || !CSGOPath || !CSGOPath.game || !CSGOPath.game.path) {
                    return [2 /*return*/, res.json({})];
                }
                switcher = [true, false];
                cfgs = [];
                switcher.forEach(function (radar) {
                    switcher.forEach(function (killfeed) {
                        cfgs.push(createCFG(radar, killfeed));
                    });
                });
                files = cfgs.map(function (cfg) { return cfg.file; });
                if (!files.every(exists)) {
                    return [2 /*return*/, res.json({ success: false, message: 'Files are missing' })];
                }
                if (!cfgs.every(isCorrect)) {
                    return [2 /*return*/, res.json({ success: false, message: 'CFGs is incorrect' })];
                }
                return [2 /*return*/, res.json({ success: true })];
        }
    });
}); };
exports.createCFGs = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var CSGOPath, cfgDir, switcher_1, cfgs;
    return __generator(this, function (_a) {
        CSGOPath = steam_game_path_1.getGamePath(730);
        if (!CSGOPath || !CSGOPath.game || !CSGOPath.game.path) {
            return [2 /*return*/, res.json({})];
        }
        cfgDir = path_1["default"].join(CSGOPath.game.path, 'csgo', 'cfg');
        try {
            switcher_1 = [true, false];
            cfgs = [];
            switcher_1.forEach(function (radar) {
                switcher_1.forEach(function (killfeed) {
                    var cfg = createCFG(radar, killfeed);
                    var cfgPath = path_1["default"].join(cfgDir, cfg.file);
                    if (fs_1["default"].existsSync(cfgPath)) {
                        fs_1["default"].unlinkSync(cfgPath);
                    }
                    fs_1["default"].writeFileSync(cfgPath, cfg.cfg, 'UTF-8');
                });
            });
            return [2 /*return*/, res.json({ success: true, message: 'Configs were successfully saved' })];
        }
        catch (_b) {
            return [2 /*return*/, res.json({ success: false, message: 'Unexpected error occured' })];
        }
        return [2 /*return*/];
    });
}); };
