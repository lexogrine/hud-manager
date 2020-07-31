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
exports.__esModule = true;
var socket_io_1 = __importDefault(require("socket.io"));
var csgogsi_1 = __importDefault(require("csgogsi"));
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var request_1 = __importDefault(require("request"));
var huds_1 = require("./../server/api/huds");
var match_1 = require("./api/match");
var fs_1 = __importDefault(require("fs"));
var portscanner_1 = __importDefault(require("portscanner"));
var config_1 = require("./api/config");
//import { testData } from './api/testing';
var teams_1 = require("./api/teams");
var players_1 = require("./api/players");
var radar = require("./../boltobserv/index.js");
var mirv = require("./server")["default"];
var DevHUDListener = /** @class */ (function () {
    function DevHUDListener(port) {
        var _this = this;
        this.checkPort = function () {
            portscanner_1["default"].checkPortStatus(_this.port, '127.0.0.1', function (err, status) {
                status = status === 'open';
                if (status !== _this.status) {
                    _this.callback(status);
                }
                _this.status = status;
            });
            /**/
        };
        this.port = port;
        this.status = false;
        this.callback = function () { };
        this.interval = -1;
    }
    DevHUDListener.prototype.onChange = function (callback) {
        this.callback = callback;
    };
    DevHUDListener.prototype.start = function () {
        if (this.interval !== -1)
            return;
        var id = setInterval(this.checkPort, 3000);
        this.interval = id;
    };
    DevHUDListener.prototype.stop = function () {
        clearInterval(this.interval);
    };
    return DevHUDListener;
}());
var HUDStateManager = /** @class */ (function () {
    function HUDStateManager() {
        this.data = new Map();
        this.devHUD = null;
    }
    HUDStateManager.prototype.save = function (hud, data) {
        return __awaiter(this, void 0, void 0, function () {
            var hudPath;
            return __generator(this, function (_a) {
                hudPath = path_1["default"].join(electron_1.app.getPath('home'), 'HUDs', hud);
                if (!fs_1["default"].existsSync(hudPath))
                    return [2 /*return*/];
                fs_1["default"].writeFileSync(path_1["default"].join(hudPath, "config.hm"), JSON.stringify(data));
                return [2 /*return*/];
            });
        });
    };
    HUDStateManager.prototype.set = function (hud, section, data) {
        var _a;
        var form = this.get(hud);
        var newForm = __assign(__assign({}, form), (_a = {}, _a[section] = data, _a));
        this.save(hud, newForm);
        this.data.set(hud, newForm);
    };
    HUDStateManager.prototype.get = function (hud, force) {
        if (force === void 0) { force = false; }
        var hudData = this.data.get(hud);
        var hudPath = path_1["default"].join(electron_1.app.getPath('home'), 'HUDs', hud);
        var hudConfig = path_1["default"].join(hudPath, "config.hm");
        if (hudData || !force || !fs_1["default"].existsSync(hudPath) || !fs_1["default"].existsSync(hudConfig))
            return hudData;
        var rawData = fs_1["default"].readFileSync(hudConfig, "utf8");
        try {
            var data = JSON.parse(rawData);
            return this.data.set(hud, data).get(hud);
        }
        catch (_a) {
            return undefined;
        }
    };
    HUDStateManager.extend = function (hudData) { return __awaiter(void 0, void 0, void 0, function () {
        var _i, _a, data, entries, _b, entries_1, entry, extraData, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!hudData || typeof hudData !== "object")
                        return [2 /*return*/, hudData];
                    _i = 0, _a = Object.values(hudData);
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 13];
                    data = _a[_i];
                    if (!data || typeof data !== "object")
                        return [2 /*return*/, hudData];
                    entries = Object.values(data);
                    _b = 0, entries_1 = entries;
                    _d.label = 2;
                case 2:
                    if (!(_b < entries_1.length)) return [3 /*break*/, 12];
                    entry = entries_1[_b];
                    if (!entry || typeof entry !== "object")
                        return [3 /*break*/, 11];
                    if (!("type" in entry) || !("id" in entry))
                        return [3 /*break*/, 11];
                    extraData = void 0;
                    _c = entry.type;
                    switch (_c) {
                        case "match": return [3 /*break*/, 3];
                        case "player": return [3 /*break*/, 5];
                        case "team": return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 3: return [4 /*yield*/, match_1.getMatchById(entry.id)];
                case 4:
                    extraData = _d.sent();
                    return [3 /*break*/, 10];
                case 5: return [4 /*yield*/, players_1.getPlayerById(entry.id)];
                case 6:
                    extraData = _d.sent();
                    return [3 /*break*/, 10];
                case 7: return [4 /*yield*/, teams_1.getTeamById(entry.id)];
                case 8:
                    extraData = _d.sent();
                    return [3 /*break*/, 10];
                case 9: return [3 /*break*/, 11];
                case 10:
                    entry[entry.type] = extraData;
                    _d.label = 11;
                case 11:
                    _b++;
                    return [3 /*break*/, 2];
                case 12:
                    _i++;
                    return [3 /*break*/, 1];
                case 13: return [2 /*return*/, hudData];
            }
        });
    }); };
    return HUDStateManager;
}());
var SocketManager = /** @class */ (function () {
    function SocketManager(io) {
        this.io = io || null;
    }
    SocketManager.prototype.set = function (io) {
        this.io = io;
    };
    return SocketManager;
}());
;
exports.Sockets = new SocketManager();
exports.HUDState = new HUDStateManager();
exports.GSI = new csgogsi_1["default"]();
function default_1(server, app) {
    var _this = this;
    function getJSONArray(url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, rej) {
                        request_1["default"].get(url, function (err, res) {
                            try {
                                if (err) {
                                    resolve(undefined);
                                    return;
                                }
                                var panel = JSON.parse(res.body);
                                if (!panel)
                                    return resolve(undefined);
                                if (!Array.isArray(panel))
                                    return resolve(undefined);
                                resolve(panel);
                            }
                            catch (_a) {
                                resolve(undefined);
                            }
                        });
                    })];
            });
        });
    }
    ;
    var runtimeConfig = {
        last: null,
        devSocket: null,
        currentHUD: null
    };
    var io = socket_io_1["default"](server);
    var intervalId = null;
    exports.Sockets.set(io);
    var portListener = new DevHUDListener(3500);
    portListener.onChange(function (status) {
        if (!status) {
            exports.HUDState.devHUD = null;
            return io.emit('reloadHUDs');
        }
        if (exports.HUDState.devHUD)
            return;
        request_1["default"].get('http://localhost:3500/hud.json', function (err, res) { return __awaiter(_this, void 0, void 0, function () {
            var hud, _a, _b, cfg, hudData, extended, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (err)
                            return [2 /*return*/, io.emit('reloadHUDs', false)];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 7, , 8]);
                        hud = JSON.parse(res.body);
                        if (!hud)
                            return [2 /*return*/];
                        if (!hud || !hud.version || !hud.author)
                            return [2 /*return*/];
                        _a = hud;
                        return [4 /*yield*/, getJSONArray('http://localhost:3500/keybinds.json')];
                    case 2:
                        _a.keybinds = _d.sent();
                        _b = hud;
                        return [4 /*yield*/, getJSONArray('http://localhost:3500/panel.json')];
                    case 3:
                        _b.panel = _d.sent();
                        hud.isDev = true;
                        hud.dir = (Math.random() * 1000 + 1).toString(36).replace(/[^a-z]+/g, '').substr(0, 15);
                        return [4 /*yield*/, config_1.loadConfig()];
                    case 4:
                        cfg = _d.sent();
                        hud.url = "http://localhost:3500/?port=" + cfg.port;
                        exports.HUDState.devHUD = hud;
                        if (!runtimeConfig.devSocket) return [3 /*break*/, 6];
                        hudData = exports.HUDState.get(hud.dir);
                        return [4 /*yield*/, HUDStateManager.extend(hudData)];
                    case 5:
                        extended = _d.sent();
                        io.to(hud.dir).emit('hud_config', extended);
                        _d.label = 6;
                    case 6:
                        io.emit('reloadHUDs');
                        return [3 /*break*/, 8];
                    case 7:
                        _c = _d.sent();
                        io.emit('reloadHUDs');
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
    });
    portListener.start();
    var customRadarCSS = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var sendDefault, hud, dir;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sendDefault = function () { return res.sendFile(path_1["default"].join(__dirname, "../boltobserv", "css", "custom.css")); };
                    if (!req.query.hud || typeof req.query.hud !== "string") {
                        return [2 /*return*/, sendDefault()];
                    }
                    return [4 /*yield*/, huds_1.getHUDData(req.query.hud)];
                case 1:
                    hud = _b.sent();
                    if (!((_a = hud === null || hud === void 0 ? void 0 : hud.boltobserv) === null || _a === void 0 ? void 0 : _a.css))
                        return [2 /*return*/, sendDefault()];
                    dir = path_1["default"].join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
                    return [2 /*return*/, res.sendFile(path_1["default"].join(dir, "radar.css"))];
            }
        });
    }); };
    app.get('/boltobserv/css/custom.css', customRadarCSS);
    app.get('/huds/:hud/custom.css', function (req, res, next) {
        req.query.hud = req.params.hud;
        return customRadarCSS(req, res, next);
    });
    app.get('/boltobserv/maps/:mapName/meta.json5', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var sendDefault, result, _a, _b, _c, hud, dir, pathFile;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    sendDefault = function () { return res.sendFile(path_1["default"].join(__dirname, "../boltobserv", "maps", req.params.mapName, "meta.json5")); };
                    if (!req.params.mapName) {
                        return [2 /*return*/, res.sendStatus(404)];
                    }
                    if (!(req.query.dev === "true")) return [3 /*break*/, 5];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, node_fetch_1["default"]("http://localhost:3500/maps/" + req.params.mapName + "/meta.json5", {})];
                case 2:
                    result = _e.sent();
                    _b = (_a = res).send;
                    return [4 /*yield*/, result.text()];
                case 3: return [2 /*return*/, _b.apply(_a, [_e.sent()])];
                case 4:
                    _c = _e.sent();
                    return [2 /*return*/, sendDefault()];
                case 5:
                    if (!req.query.hud || typeof req.query.hud !== "string")
                        return [2 /*return*/, sendDefault()];
                    return [4 /*yield*/, huds_1.getHUDData(req.query.hud)];
                case 6:
                    hud = _e.sent();
                    if (!((_d = hud === null || hud === void 0 ? void 0 : hud.boltobserv) === null || _d === void 0 ? void 0 : _d.maps))
                        return [2 /*return*/, sendDefault()];
                    dir = path_1["default"].join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
                    pathFile = path_1["default"].join(dir, "maps", req.params.mapName, "meta.json5");
                    if (!fs_1["default"].existsSync(pathFile))
                        return [2 /*return*/, sendDefault()];
                    return [2 /*return*/, res.sendFile(pathFile)];
            }
        });
    }); });
    app.get('/boltobserv/maps/:mapName/radar.png', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var sendDefault, hud, dir, pathFile;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sendDefault = function () { return res.sendFile(path_1["default"].join(__dirname, "../boltobserv", "maps", req.params.mapName, "radar.png")); };
                    if (!req.params.mapName) {
                        return [2 /*return*/, res.sendStatus(404)];
                    }
                    if (!req.query.hud || typeof req.query.hud !== "string")
                        return [2 /*return*/, sendDefault()];
                    return [4 /*yield*/, huds_1.getHUDData(req.query.hud)];
                case 1:
                    hud = _b.sent();
                    if (!((_a = hud === null || hud === void 0 ? void 0 : hud.boltobserv) === null || _a === void 0 ? void 0 : _a.maps))
                        return [2 /*return*/, sendDefault()];
                    dir = path_1["default"].join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
                    pathFile = path_1["default"].join(dir, "maps", req.params.mapName, "radar.png");
                    if (!fs_1["default"].existsSync(pathFile))
                        return [2 /*return*/, sendDefault()];
                    return [2 /*return*/, res.sendFile(pathFile)];
            }
        });
    }); });
    radar.startRadar(app, io);
    app.post('/', function (req, res) {
        runtimeConfig.last = req.body;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            io.emit('enableTest', true);
        }
        io.emit('update', req.body);
        exports.GSI.digest(req.body);
        radar.digestRadar(req.body);
        res.sendStatus(200);
    });
    app.post('/api/test', function (_req, res) {
        var _a, _b;
        res.sendStatus(200);
        if (intervalId)
            return;
        if (((_b = (_a = runtimeConfig.last) === null || _a === void 0 ? void 0 : _a.provider) === null || _b === void 0 ? void 0 : _b.timestamp) && (new Date()).getTime() - runtimeConfig.last.provider.timestamp * 1000 <= 5000)
            return;
        /*
        io.emit('enableTest', false);
        
        let i = 0;
        intervalId = setInterval(() => {
            if(!testData[i]) {
                clearInterval(intervalId);
                intervalId = null;
                io.emit('enableTest', true);
                return;
            }
            io.emit('update', testData[i]);
            i++;
        }, 16);*/
    });
    io.on('connection', function (socket) {
        socket.on('started', function () {
            if (runtimeConfig.last) {
                socket.emit("update", runtimeConfig.last);
            }
        });
        socket.emit('readyToRegister');
        socket.on('register', function (name, isDev) { return __awaiter(_this, void 0, void 0, function () {
            var hudData, extended, hudData, extended;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!isDev) return [3 /*break*/, 2];
                        socket.join(name);
                        hudData = exports.HUDState.get(name, true);
                        return [4 /*yield*/, HUDStateManager.extend(hudData)];
                    case 1:
                        extended = _a.sent();
                        io.to(name).emit('hud_config', extended);
                        return [2 /*return*/];
                    case 2:
                        runtimeConfig.devSocket = socket;
                        if (!exports.HUDState.devHUD) return [3 /*break*/, 4];
                        socket.join(exports.HUDState.devHUD.dir);
                        hudData = exports.HUDState.get(exports.HUDState.devHUD.dir);
                        return [4 /*yield*/, HUDStateManager.extend(hudData)];
                    case 3:
                        extended = _a.sent();
                        io.to(exports.HUDState.devHUD.dir).emit('hud_config', extended);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        socket.on('hud_config', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var hudData, extended;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exports.HUDState.set(data.hud, data.section, data.config);
                        hudData = exports.HUDState.get(data.hud);
                        return [4 /*yield*/, HUDStateManager.extend(hudData)];
                    case 1:
                        extended = _a.sent();
                        io.to(data.hud).emit('hud_config', extended);
                        return [2 /*return*/];
                }
            });
        }); });
        socket.on('hud_action', function (data) {
            io.to(data.hud).emit("hud_action", data.action);
        });
        socket.on('get_config', function (hud) {
            socket.emit("hud_config", exports.HUDState.get(hud, true));
        });
        socket.on("set_active_hlae", function (hudUrl) {
            if (runtimeConfig.currentHUD === hudUrl) {
                runtimeConfig.currentHUD = null;
            }
            else {
                runtimeConfig.currentHUD = hudUrl;
            }
            io.emit('active_hlae', runtimeConfig.currentHUD);
        });
        socket.on("get_active_hlae", function () {
            io.emit('active_hlae', runtimeConfig.currentHUD);
        });
    });
    mirv(function (data) {
        io.emit("update_mirv", data);
    });
    exports.GSI.on("data", match_1.updateRound);
    exports.GSI.on("roundEnd", function (score) { return __awaiter(_this, void 0, void 0, function () {
        var matches, match, vetos, mapName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (score.loser && score.loser.logo) {
                        delete score.loser.logo;
                    }
                    if (score.winner && score.winner.logo) {
                        delete score.winner.logo;
                    }
                    return [4 /*yield*/, match_1.getMatches()];
                case 1:
                    matches = _a.sent();
                    match = matches.filter(function (match) { return match.current; })[0];
                    if (!match)
                        return [2 /*return*/];
                    vetos = match.vetos;
                    mapName = score.map.name.substring(score.map.name.lastIndexOf('/') + 1);
                    vetos.map(function (veto) {
                        if (veto.mapName !== mapName || !score.map.team_ct.id || !score.map.team_t.id || veto.mapEnd) {
                            return veto;
                        }
                        if (!veto.score) {
                            veto.score = {};
                        }
                        veto.score[score.map.team_ct.id] = score.map.team_ct.score;
                        veto.score[score.map.team_t.id] = score.map.team_t.score;
                        if (veto.reverseSide) {
                            veto.score[score.map.team_t.id] = score.map.team_ct.score;
                            veto.score[score.map.team_ct.id] = score.map.team_t.score;
                        }
                        return veto;
                    });
                    match.vetos = vetos;
                    return [4 /*yield*/, match_1.updateMatches(matches)];
                case 2:
                    _a.sent();
                    io.emit('match', true);
                    return [2 /*return*/];
            }
        });
    }); });
    exports.GSI.on("matchEnd", function (score) { return __awaiter(_this, void 0, void 0, function () {
        var matches, match, mapName, vetos, isReversed_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, match_1.getMatches()];
                case 1:
                    matches = _a.sent();
                    match = matches.filter(function (match) { return match.current; })[0];
                    mapName = score.map.name.substring(score.map.name.lastIndexOf('/') + 1);
                    if (!match) return [3 /*break*/, 3];
                    vetos = match.vetos;
                    isReversed_1 = vetos.filter(function (veto) { return veto.mapName === mapName && veto.reverseSide; })[0];
                    vetos.map(function (veto) {
                        if (veto.mapName !== mapName || !score.map.team_ct.id || !score.map.team_t.id) {
                            return veto;
                        }
                        veto.winner = score.map.team_ct.score > score.map.team_t.score ? score.map.team_ct.id : score.map.team_t.id;
                        if (isReversed_1) {
                            veto.winner = score.map.team_ct.score > score.map.team_t.score ? score.map.team_t.id : score.map.team_ct.id;
                        }
                        if (veto.score && veto.score[veto.winner]) {
                            veto.score[veto.winner]++;
                        }
                        veto.mapEnd = true;
                        return veto;
                    });
                    if (match.left.id === score.winner.id) {
                        if (isReversed_1) {
                            match.right.wins++;
                        }
                        else {
                            match.left.wins++;
                        }
                    }
                    else if (match.right.id === score.winner.id) {
                        if (isReversed_1) {
                            match.left.wins++;
                        }
                        else {
                            match.right.wins++;
                        }
                    }
                    match.vetos = vetos;
                    return [4 /*yield*/, match_1.updateMatches(matches)];
                case 2:
                    _a.sent();
                    io.emit('match', true);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    return io;
}
exports["default"] = default_1;
