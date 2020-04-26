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
var radar = require("./../boltobserv/index.js");
var mirv = require("./server")["default"];
var launchTime = (new Date()).getTime();
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
    HUDStateManager.prototype.set = function (hud, section, data) {
        var _a;
        var form = this.get(hud);
        var newForm = __assign(__assign({}, form), (_a = {}, _a[section] = data, _a));
        this.data.set(hud, newForm);
    };
    HUDStateManager.prototype.get = function (hud) {
        return this.data.get(hud);
    };
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
    var last = null;
    var devSocket = null;
    var io = socket_io_1["default"](server);
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
            var hud, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (err)
                            return [2 /*return*/, io.emit('reloadHUDs', false)];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
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
                        hud.url = 'http://localhost:3500/';
                        exports.HUDState.devHUD = hud;
                        if (devSocket) {
                            io.to(hud.dir).emit('hud_config', exports.HUDState.get(hud.dir));
                        }
                        io.emit('reloadHUDs');
                        return [3 /*break*/, 5];
                    case 4:
                        _c = _d.sent();
                        io.emit('reloadHUDs');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    });
    portListener.start();
    app.get('/boltobserv/css/custom.css', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var sendDefault, hud, dir;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sendDefault = function () { return res.sendFile(path_1["default"].join(__dirname, "../boltobserv", "css", "custom.css")); };
                    if (!req.query.hud) {
                        return [2 /*return*/, sendDefault()];
                    }
                    return [4 /*yield*/, huds_1.getHUDData(req.query.hud)];
                case 1:
                    hud = _c.sent();
                    if (!((_b = (_a = hud) === null || _a === void 0 ? void 0 : _a.boltobserv) === null || _b === void 0 ? void 0 : _b.css))
                        return [2 /*return*/, sendDefault()];
                    dir = path_1["default"].join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
                    return [2 /*return*/, res.sendFile(path_1["default"].join(dir, "radar.css"))];
            }
        });
    }); });
    app.get('/boltobserv/maps/:mapName/meta.json5', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var sendDefault, result, _a, _b, _c, hud, dir, pathFile;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    sendDefault = function () { return res.sendFile(path_1["default"].join(__dirname, "../boltobserv", "maps", req.params.mapName, "meta.json5")); };
                    if (!req.params.mapName) {
                        return [2 /*return*/, res.sendStatus(404)];
                    }
                    if (!(req.query.dev === "true")) return [3 /*break*/, 5];
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, node_fetch_1["default"]("http://localhost:3500/maps/" + req.params.mapName + "/meta.json5", {})];
                case 2:
                    result = _f.sent();
                    _b = (_a = res).send;
                    return [4 /*yield*/, result.text()];
                case 3: return [2 /*return*/, _b.apply(_a, [_f.sent()])];
                case 4:
                    _c = _f.sent();
                    return [2 /*return*/, sendDefault()];
                case 5:
                    if (!req.query.hud)
                        return [2 /*return*/, sendDefault()];
                    return [4 /*yield*/, huds_1.getHUDData(req.query.hud)];
                case 6:
                    hud = _f.sent();
                    if (!((_e = (_d = hud) === null || _d === void 0 ? void 0 : _d.boltobserv) === null || _e === void 0 ? void 0 : _e.maps))
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
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sendDefault = function () { return res.sendFile(path_1["default"].join(__dirname, "../boltobserv", "maps", req.params.mapName, "radar.png")); };
                    if (!req.params.mapName) {
                        return [2 /*return*/, res.sendStatus(404)];
                    }
                    if (!req.query.hud)
                        return [2 /*return*/, sendDefault()];
                    return [4 /*yield*/, huds_1.getHUDData(req.query.hud)];
                case 1:
                    hud = _c.sent();
                    if (!((_b = (_a = hud) === null || _a === void 0 ? void 0 : _a.boltobserv) === null || _b === void 0 ? void 0 : _b.maps))
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
        res.sendStatus(200);
        last = req.body;
        io.emit('update', req.body);
        exports.GSI.digest(req.body);
        radar.digestRadar(req.body);
        /*try {
            if((new Date()).getTime() - launchTime > 10000){
                request.post('http://localhost:36363/', { json: req.body });
            }
        } catch {}*/
    });
    io.on('connection', function (socket) {
        socket.on('started', function () {
            if (last) {
                socket.emit("update", last);
            }
        });
        socket.emit('readyToRegister');
        socket.on('register', function (name, isDev) {
            if (!isDev) {
                socket.join(name);
                io.to(name).emit('hud_config', exports.HUDState.get(name));
                return;
            }
            devSocket = socket;
            if (exports.HUDState.devHUD) {
                socket.join(exports.HUDState.devHUD.dir);
                io.to(exports.HUDState.devHUD.dir).emit('hud_config', exports.HUDState.get(exports.HUDState.devHUD.dir));
            }
        });
        socket.on('hud_config', function (data) {
            exports.HUDState.set(data.hud, data.section, data.config);
            io.to(data.hud).emit('hud_config', exports.HUDState.get(data.hud));
        });
        socket.on('hud_action', function (data) {
            io.to(data.hud).emit("hud_action", data.action);
        });
        socket.on('get_config', function (hud) {
            socket.emit("hud_config", exports.HUDState.get(hud));
        });
    });
    mirv(function (data) {
        io.emit("update_mirv", data);
    });
    exports.GSI.on("roundEnd", function (score) { return __awaiter(_this, void 0, void 0, function () {
        var matches, match, vetos, mapName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, match_1.getMatches()];
                case 1:
                    matches = _a.sent();
                    match = matches.filter(function (match) { return match.current; })[0];
                    if (!match)
                        return [2 /*return*/];
                    vetos = match.vetos;
                    mapName = score.map.name.substring(score.map.name.lastIndexOf('/') + 1);
                    vetos.map(function (veto) {
                        if (veto.mapName !== mapName || !score.map.team_ct.id || !score.map.team_t.id || veto.mapEnd) {
                            if (!veto.mapEnd || !veto.winner || !veto.score || !score.winner || !score.loser) {
                                return veto;
                            }
                            var sumRecorded = Object.values(veto.score).reduce(function (a, b) { return a + b; }, 0);
                            var sumReceived = score.winner.score + score.loser.score;
                            if (Math.abs(sumReceived - sumRecorded) !== 1) {
                                return score;
                            }
                            var ids = Object.keys(veto.score);
                            if (!Number.isInteger(veto.score[ids[0]]) || !Number.isInteger(veto.score[ids[1]])) {
                                return score;
                            }
                            if (veto.score[ids[0]] > veto.score[ids[1]]) {
                                veto.score[ids[0]]++;
                            }
                            else if (veto.score[ids[0]] < veto.score[ids[1]]) {
                                veto.score[ids[1]]++;
                            }
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
                    return [4 /*yield*/, match_1.updateMatch(matches)];
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
                    return [4 /*yield*/, match_1.updateMatch(matches)];
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
