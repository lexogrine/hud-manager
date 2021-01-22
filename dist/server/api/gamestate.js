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
exports.cfgsZIPBase64 = exports.saveFile = exports.createGSIFile = exports.generateGSIFile = exports.checkGSIFile = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var VDF = __importStar(require("@node-steam/vdf"));
var steam_game_path_1 = require("steam-game-path");
var config_1 = require("./config");
var electron_1 = require("electron");
var csgogsi_generator_1 = __importDefault(require("csgogsi-generator"));
var GSITemplate = csgogsi_generator_1["default"]('HUDMANAGERGSI', 'http://localhost:1349/').json;
exports.checkGSIFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, GamePath, cfgPath, rawContent, content;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                config = _b.sent();
                try {
                    GamePath = steam_game_path_1.getGamePath(730);
                }
                catch (_c) {
                    return [2 /*return*/, res.json({ success: false, message: "Game path couldn't be found", accessible: false })];
                }
                if (!config || !GamePath || !GamePath.game || !GamePath.game.path) {
                    return [2 /*return*/, res.json({ success: false, message: "Game path couldn't be found", accessible: false })];
                }
                cfgPath = path_1["default"].join(GamePath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
                if (!fs_1["default"].existsSync(cfgPath)) {
                    return [2 /*return*/, res.json({ success: false, message: "File couldn't be found", accessible: true })];
                }
                try {
                    rawContent = fs_1["default"].readFileSync(cfgPath, 'UTF-8');
                    content = (_a = VDF.parse(rawContent)) === null || _a === void 0 ? void 0 : _a.HUDMANAGERGSI;
                    if (!content) {
                        //Corrupted file
                        return [2 /*return*/, res.json({ success: false, message: 'File seems to be corrupted', accessible: true })];
                    }
                    if (!content.uri.endsWith(":" + config.port + "/")) {
                        // wrong port
                        return [2 /*return*/, res.json({ success: false, message: 'Wrong address', accessible: true })];
                    }
                    if (JSON.stringify(GSITemplate.HUDMANAGERGSI.data) !== JSON.stringify(content.data)) {
                        // wrong settings
                        return [2 /*return*/, res.json({ success: false, message: 'Wrong configuration', accessible: true })];
                    }
                    if (!content.auth && config.token) {
                        return [2 /*return*/, res.json({ success: false, message: 'Wrong token', accessible: true })];
                    }
                    if (content.auth && content.auth.token !== config.token) {
                        return [2 /*return*/, res.json({ success: false, message: 'Wrong token', accessible: true })];
                    }
                    return [2 /*return*/, res.json({ success: true })];
                }
                catch (_d) {
                    return [2 /*return*/, res.json({ success: false, message: 'Unexpected error occured', accessible: true })];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.generateGSIFile = function () { return __awaiter(void 0, void 0, void 0, function () {
    var config, address, text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                config = _a.sent();
                if (!config) {
                    return [2 /*return*/, null];
                }
                address = "http://localhost:" + config.port + "/";
                text = csgogsi_generator_1["default"]('HUDMANAGERGSI', address, config.token).vdf;
                return [2 /*return*/, text];
        }
    });
}); };
exports.createGSIFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var text, GamePath, cfgPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.generateGSIFile()];
            case 1:
                text = _a.sent();
                if (!text) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                try {
                    GamePath = steam_game_path_1.getGamePath(730);
                }
                catch (_b) {
                    return [2 /*return*/, res.json({})];
                }
                if (!GamePath || !GamePath.game || !GamePath.game.path) {
                    return [2 /*return*/, res.json({})];
                }
                cfgPath = path_1["default"].join(GamePath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
                try {
                    if (fs_1["default"].existsSync(cfgPath)) {
                        fs_1["default"].unlinkSync(cfgPath);
                    }
                    fs_1["default"].writeFileSync(cfgPath, text, 'UTF-8');
                    return [2 /*return*/, res.json({ success: true, message: 'Config file was successfully saved' })];
                }
                catch (_c) {
                    return [2 /*return*/, res.json({ success: false, message: 'Unexpected error occured' })];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.saveFile = function (name, content, base64) {
    if (base64 === void 0) { base64 = false; }
    return function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var result, text, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    res.sendStatus(200);
                    return [4 /*yield*/, electron_1.dialog.showSaveDialog({ defaultPath: name })];
                case 1:
                    result = _b.sent();
                    if (!(typeof content === 'string')) return [3 /*break*/, 2];
                    _a = content;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, content];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    text = _a;
                    if (result.filePath) {
                        fs_1["default"].writeFileSync(result.filePath, text, { encoding: base64 ? 'base64' : 'UTF-8' });
                    }
                    return [2 /*return*/];
            }
        });
    }); };
};
exports.cfgsZIPBase64 = 'UEsDBBQAAAAIAJOYXE84wXDJWAAAAHQAAAAWAAAAaHVkX3JhZGFyX2tpbGxmZWVkLmNmZ1XKQQqAIBAAwHuvEO8h4iHoM4uoZbC5sa5Jv48giM4zASGy70AFL4jJSy4kW0hV2eG13CIsxCH9fbTDvvEJx4qqMSrd62wMUvCYqcrsrHOTeYr+YhXPcgNQSwMEFAAAAAgAk5hcTyCrGb0xAAAANAAAAAcAAABodWQuY2ZnS86JTylKLI/Pz8upjE9JTSzJyMsvyUxOLVYw5ILKZZSmxKflFyWnxhclpiQWKRgCAFBLAwQUAAAACACTmFxPoMM5S18AAACNAAAAEAAAAGh1ZF9raWxsZmVlZC5jZmdtyzEKgDAMQNHdUxR3KaWD0MuE0FYrRCNpVLy9CIIIzv/9SJAED+CFTkgZtSysU8zVuOZpZUswsMQMggnlL3zGzjXzJDusI5lNyLRHDdYSR6TCVYN33vf2Ju0Lq6LoBVBLAwQUAAAACACTmFxPJlBm3h0AAAAbAAAADQAAAGh1ZF9yYWRhci5jZmdLzolPKUosj8/Py6mMT0lNLMnIyy/JTE4tVjAEAFBLAQIfABQAAAAIAJOYXE84wXDJWAAAAHQAAAAWACQAAAAAAAAAIAAAAAAAAABodWRfcmFkYXJfa2lsbGZlZWQuY2ZnCgAgAAAAAAABABgA9RNKKrqN1QFdZynbBcfVAUpAKdsFx9UBUEsBAh8AFAAAAAgAk5hcTyCrGb0xAAAANAAAAAcAJAAAAAAAAAAgAAAAjAAAAGh1ZC5jZmcKACAAAAAAAAEAGACvXUwquo3VAYS1KdsFx9UBhLUp2wXH1QFQSwECHwAUAAAACACTmFxPoMM5S18AAACNAAAAEAAkAAAAAAAAACAAAADiAAAAaHVkX2tpbGxmZWVkLmNmZwoAIAAAAAAAAQAYAFpzSyq6jdUBfisq2wXH1QGtAyrbBcfVAVBLAQIfABQAAAAIAJOYXE8mUGbeHQAAABsAAAANACQAAAAAAAAAIAAAAG8BAABodWRfcmFkYXIuY2ZnCgAgAAAAAAABABgALddKKrqN1QHxnyrbBcfVAeR4KtsFx9UBUEsFBgAAAAAEAAQAggEAALcBAAAAAA==';
