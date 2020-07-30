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
var sockets_1 = require("./../sockets");
var database_1 = __importDefault(require("./../../init/database"));
var teams_1 = require("./teams");
var electron_1 = require("electron");
var v4_1 = __importDefault(require("uuid/v4"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var matchesDb = database_1["default"].matches;
exports.getMatchesRoute = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var matches;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getMatches()];
            case 1:
                matches = _a.sent();
                return [2 /*return*/, res.json(matches)];
        }
    });
}); };
exports.getMatches = function () {
    return new Promise(function (res, rej) {
        matchesDb.find({}, function (err, matches) {
            if (err) {
                return res([]);
            }
            return res(matches);
        });
    });
};
exports.setMatches = function (matches) {
    return new Promise(function (res, rej) {
        matchesDb.remove({}, { multi: true }, function (err, n) {
            if (err) {
                return res(null);
            }
            matchesDb.insert(matches, function (err, added) {
                if (err) {
                    return res(null);
                }
                return res(added);
            });
        });
    });
};
exports.updateMatch = function (updateMatches) { return __awaiter(void 0, void 0, void 0, function () {
    var currents, left, right, matchesFixed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                currents = updateMatches.filter(function (match) { return match.current; });
                if (currents.length > 1) {
                    updateMatches = updateMatches.map(function (match) { return (__assign(__assign({}, match), { current: false })); });
                }
                if (!currents.length) return [3 /*break*/, 3];
                return [4 /*yield*/, teams_1.getTeamById(currents[0].left.id)];
            case 1:
                left = _a.sent();
                return [4 /*yield*/, teams_1.getTeamById(currents[0].right.id)];
            case 2:
                right = _a.sent();
                if (left && left._id) {
                    sockets_1.GSI.setTeamOne({ id: left._id, name: left.name, country: left.country, logo: left.logo, map_score: currents[0].left.wins });
                }
                if (right && right._id) {
                    sockets_1.GSI.setTeamTwo({ id: right._id, name: right.name, country: right.country, logo: right.logo, map_score: currents[0].right.wins });
                }
                _a.label = 3;
            case 3:
                matchesFixed = updateMatches.map(function (match) {
                    if (match.id.length)
                        return match;
                    match.id = v4_1["default"]();
                    return match;
                });
                return [4 /*yield*/, exports.setMatches(matchesFixed)];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.setMatch = function (io) { return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var matches;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.updateMatch(req.body)];
            case 1:
                _a.sent();
                io.emit('match');
                return [4 /*yield*/, exports.getMatches()];
            case 2:
                matches = _a.sent();
                return [2 /*return*/, res.json(matches)];
        }
    });
}); }; };
exports.getMaps = function (req, res) {
    var defaultMaps = ["de_mirage", "de_dust2", "de_inferno", "de_nuke", "de_train", "de_overpass", "de_vertigo"];
    var mapFilePath = path_1["default"].join(electron_1.app.getPath('userData'), 'maps.json');
    try {
        var maps = JSON.parse(fs_1["default"].readFileSync(mapFilePath, "utf8"));
        if (Array.isArray(maps)) {
            return res.json(maps);
        }
        return res.json(defaultMaps);
    }
    catch (_a) {
        return res.json(defaultMaps);
    }
};
exports.reverseSide = function (io) { return __awaiter(void 0, void 0, void 0, function () {
    var matches, current, currentVetoMap;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getMatches()];
            case 1:
                matches = _a.sent();
                current = matches.find(function (match) { return match.current; });
                if (!current)
                    return [2 /*return*/];
                if (current.vetos.filter(function (veto) { return veto.teamId; }).length > 0 && !sockets_1.GSI.last) {
                    return [2 /*return*/];
                }
                if (!(current.vetos.filter(function (veto) { return veto.teamId; }).length === 0)) return [3 /*break*/, 3];
                current.left = [current.right, current.right = current.left][0];
                return [4 /*yield*/, exports.updateMatch([current])];
            case 2:
                _a.sent();
                return [2 /*return*/, io.emit("match", true)];
            case 3:
                currentVetoMap = current.vetos.find(function (veto) { return sockets_1.GSI.last.map.name.includes(veto.mapName); });
                if (!currentVetoMap)
                    return [2 /*return*/];
                currentVetoMap.reverseSide = !currentVetoMap.reverseSide;
                return [4 /*yield*/, exports.updateMatch([current])];
            case 4:
                _a.sent();
                io.emit("match", true);
                return [2 /*return*/];
        }
    });
}); };
exports.updateRound = function (game) { return __awaiter(void 0, void 0, void 0, function () {
    var getWinType, round, roundData, _i, _a, player, matches, match, mapName, veto;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                getWinType = function (round_win) {
                    switch (round_win) {
                        case "ct_win_defuse":
                            return "defuse";
                        case "ct_win_elimination":
                        case "t_win_elimination":
                            return "elimination";
                        case "ct_win_time":
                            return "time";
                        case "t_win_bomb":
                            return "bomb";
                        default:
                            return "time";
                    }
                };
                if (!game || !game.map || game.map.phase !== "live")
                    return [2 /*return*/];
                round = game.map.round;
                if (game.round && game.round.phase !== "over") {
                    round++;
                }
                roundData = {
                    round: round,
                    players: {},
                    winner: null,
                    win_type: null
                };
                if (game.round && game.round.win_team && game.map.round_wins && game.map.round_wins[round]) {
                    roundData.winner = game.round.win_team;
                    roundData.win_type = getWinType(game.map.round_wins[round]);
                }
                for (_i = 0, _a = game.players; _i < _a.length; _i++) {
                    player = _a[_i];
                    roundData.players[player.steamid] = {
                        kills: player.state.round_kills,
                        killshs: player.state.round_killhs,
                        damage: player.state.round_totaldmg
                    };
                }
                return [4 /*yield*/, exports.getMatches()];
            case 1:
                matches = _b.sent();
                match = matches.find(function (match) { return match.current; });
                if (!match)
                    return [2 /*return*/];
                mapName = game.map.name.substring(game.map.name.lastIndexOf('/') + 1);
                veto = match.vetos.find(function (veto) { return veto.mapName === mapName && !veto.mapEnd; });
                if (!veto || veto.mapEnd)
                    return [2 /*return*/];
                if (veto.rounds && veto.rounds[roundData.round - 1] && JSON.stringify(veto.rounds[roundData.round - 1]) === JSON.stringify(roundData))
                    return [2 /*return*/];
                match.vetos = match.vetos.map(function (veto) {
                    if (veto.mapName !== mapName)
                        return veto;
                    if (!veto.rounds)
                        veto.rounds = [];
                    veto.rounds[roundData.round - 1] = roundData;
                    veto.rounds = veto.rounds.splice(0, roundData.round);
                    return veto;
                });
                return [2 /*return*/, exports.updateMatch(matches)];
        }
    });
}); };
