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
var request_1 = __importDefault(require("request"));
var match_1 = require("./api/match");
var mirv = require("./server")["default"];
var HUDStateManager = /** @class */ (function () {
    function HUDStateManager() {
        this.data = new Map();
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
exports.HUDState = new HUDStateManager();
exports.GSI = new csgogsi_1["default"]();
function default_1(server, app) {
    var _this = this;
    var last = null;
    var io = socket_io_1["default"](server);
    app.post('/', function (req, res) {
        res.sendStatus(200);
        last = req.body;
        io.emit('update', req.body);
        exports.GSI.digest(req.body);
        request_1["default"].post('http://localhost:36363/', { json: req.body });
    });
    io.on('connection', function (socket) {
        socket.on('ready', function () {
            if (last) {
                socket.emit("update", last);
            }
        });
        socket.on('hud_config', function (data) {
            exports.HUDState.set(data.hud, data.section, data.config);
            io.emit("hud_config_" + data.hud, exports.HUDState.get(data.hud));
        });
        socket.on('hud_action', function (data) {
            console.log(data);
            io.emit("hud_action_" + data.hud, data.action);
        });
        socket.on('get_config', function (hud) {
            socket.emit("hud_config", exports.HUDState.get(hud));
        });
    });
    mirv(function (data) {
        io.emit("update_mirv", data);
    });
    exports.GSI.on("roundEnd", function (score) {
        var matches = match_1.getMatchesV2();
        var match = matches.filter(function (match) { return match.current; })[0];
        if (match) {
            var vetos = match.vetos;
            vetos.map(function (veto) {
                if (veto.mapName !== score.map.name || !score.map.team_ct.id || !score.map.team_t.id) {
                    return veto;
                }
                if (!veto.score) {
                    veto.score = {};
                }
                veto.score[score.map.team_ct.id] = score.map.team_ct.score;
                veto.score[score.map.team_t.id] = score.map.team_t.score;
                return veto;
            });
            match.vetos = vetos;
            match_1.updateMatch(matches);
            io.emit('match', true);
        }
    });
    exports.GSI.on("matchEnd", function (score) { return __awaiter(_this, void 0, void 0, function () {
        var matches, match, vetos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    matches = match_1.getMatchesV2();
                    match = matches.filter(function (match) { return match.current; })[0];
                    if (!match) return [3 /*break*/, 2];
                    vetos = match.vetos;
                    vetos.map(function (veto) {
                        if (veto.mapName !== score.map.name || !score.map.team_ct.id || !score.map.team_t.id) {
                            return veto;
                        }
                        veto.winner = score.map.team_ct.score > score.map.team_t.score ? score.map.team_ct.id : score.map.team_t.id;
                        veto.mapEnd = true;
                        return veto;
                    });
                    if (match.left.id === score.winner.id) {
                        match.left.wins++;
                    }
                    else if (match.right.id === score.winner.id) {
                        match.right.wins++;
                    }
                    match.vetos = vetos;
                    return [4 /*yield*/, match_1.updateMatch(matches)];
                case 1:
                    _a.sent();
                    io.emit('match', true);
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
    return io;
}
exports["default"] = default_1;
