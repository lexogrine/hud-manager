"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var VDF = __importStar(require("@node-steam/vdf"));
var steam_game_path_1 = require("steam-game-path");
var config_1 = require("./config");
var GSITemplate = {
    'HUDMANAGERGSI': {
        uri: 'http://localhost:1337/',
        timeout: 0.1,
        buffer: 0,
        throttle: 0,
        heartbeat: 0.01,
        data: {
            provider: 1,
            map: 1,
            round: 1,
            player_id: 1,
            allplayers_id: 1,
            player_state: 1,
            allplayers_state: 1,
            allplayers_match_stats: 1,
            allplayers_weapons: 1,
            allplayers_position: 1,
            phase_countdowns: 1,
            allgrenades: 1,
            map_round_wins: 1,
            player_position: 1,
            bomb: 1
        }
    }
};
exports.checkGSIFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, CSGOPath, cfgPath, rawContent, content;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                config = _a.sent();
                CSGOPath = steam_game_path_1.getGamePath(730);
                if (!config || !CSGOPath || !CSGOPath.game || !CSGOPath.game.path) {
                    return [2 /*return*/, res.json({})];
                }
                cfgPath = path_1["default"].join(CSGOPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
                if (!fs_1["default"].existsSync(cfgPath)) {
                    return [2 /*return*/, res.json({ success: false, message: 'File couldn\'t be found' })];
                }
                try {
                    rawContent = fs_1["default"].readFileSync(cfgPath, 'UTF-8');
                    content = VDF.parse(rawContent);
                    if (!content || !content.HUDMANAGERGSI) {
                        //Corrupted file
                        return [2 /*return*/, res.json({ success: false, message: 'File seems to be corrupted' })];
                    }
                    if (!content.HUDMANAGERGSI.uri.endsWith(":" + config.port + "/")) {
                        // wrong port
                        return [2 /*return*/, res.json({ success: false, message: 'Wrong address' })];
                    }
                    if (JSON.stringify(GSITemplate.HUDMANAGERGSI.data) != JSON.stringify(content.HUDMANAGERGSI.data)) {
                        // wrong settings
                        return [2 /*return*/, res.json({ success: false, message: 'Wrong configuration' })];
                    }
                    return [2 /*return*/, res.json({ success: true })];
                }
                catch (_b) {
                    return [2 /*return*/, res.json({ success: false, message: 'Unexpected error occured' })];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.createGSIFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, CSGOPath, address, gsiCFG, text, cfgPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                config = _a.sent();
                if (!config) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                CSGOPath = steam_game_path_1.getGamePath(730);
                if (!CSGOPath || !CSGOPath.game || !CSGOPath.game.path) {
                    return [2 /*return*/, res.json({})];
                }
                address = "http://localhost:" + config.port + "/";
                gsiCFG = __assign({}, GSITemplate);
                gsiCFG.HUDMANAGERGSI.uri = address;
                text = VDF.stringify(gsiCFG);
                cfgPath = path_1["default"].join(CSGOPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
                try {
                    if (fs_1["default"].existsSync(cfgPath)) {
                        fs_1["default"].unlinkSync(cfgPath);
                    }
                    fs_1["default"].writeFileSync(cfgPath, text, 'UTF-8');
                    return [2 /*return*/, res.json({ success: true, message: 'Config file was successfully saved' })];
                }
                catch (_b) {
                    return [2 /*return*/, res.json({ success: false, message: 'Unexpected error occured' })];
                }
                return [2 /*return*/];
        }
    });
}); };
