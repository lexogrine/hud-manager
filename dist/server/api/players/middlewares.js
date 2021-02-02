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
exports.updateFields = exports.getFields = exports.getAvatarURLBySteamID = exports.getAvatarFile = exports.deletePlayer = exports.addPlayer = exports.updatePlayer = exports.getPlayer = exports.getPlayers = void 0;
var database_1 = __importDefault(require("./../../../init/database"));
var config_1 = require("./../config");
var node_fetch_1 = __importDefault(require("node-fetch"));
var isSvg_1 = __importDefault(require("./../../../src/isSvg"));
var index_1 = require("./index");
var F = __importStar(require("./../fields"));
var players = database_1["default"].players;
exports.getPlayers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var players, config;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, index_1.getPlayersList({})];
            case 1:
                players = _a.sent();
                return [4 /*yield*/, config_1.loadConfig()];
            case 2:
                config = _a.sent();
                return [2 /*return*/, res.json(players.map(function (player) { return (__assign(__assign({}, player), { avatar: player.avatar && player.avatar.length
                            ? "http://" + config_1.internalIP + ":" + config.port + "/api/players/avatar/" + player._id
                            : null })); }))];
        }
    });
}); };
exports.getPlayer = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var player;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, index_1.getPlayerById(req.params.id)];
            case 1:
                player = _a.sent();
                if (!player) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                return [2 /*return*/, res.json(player)];
        }
    });
}); };
exports.updatePlayer = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var player, updated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, index_1.getPlayerById(req.params.id, true)];
            case 1:
                player = _a.sent();
                if (!player) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                updated = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req.body.username,
                    avatar: req.body.avatar,
                    country: req.body.country,
                    steamid: req.body.steamid,
                    team: req.body.team,
                    extra: req.body.extra
                };
                if (req.body.avatar === undefined) {
                    updated.avatar = player.avatar;
                }
                players.update({ _id: req.params.id }, { $set: updated }, {}, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var player;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    return [2 /*return*/, res.sendStatus(500)];
                                }
                                return [4 /*yield*/, index_1.getPlayerById(req.params.id)];
                            case 1:
                                player = _a.sent();
                                return [2 /*return*/, res.json(player)];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); };
exports.addPlayer = function (req, res) {
    var newPlayer = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        avatar: req.body.avatar,
        country: req.body.country,
        steamid: req.body.steamid,
        team: req.body.team,
        extra: req.body.extra
    };
    players.insert(newPlayer, function (err, player) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.json(player);
    });
};
exports.deletePlayer = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var player;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, index_1.getPlayerById(req.params.id)];
            case 1:
                player = _a.sent();
                if (!player) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                players.remove({ _id: req.params.id }, function (err, n) {
                    if (err) {
                        return res.sendStatus(500);
                    }
                    return res.sendStatus(n ? 200 : 404);
                });
                return [2 /*return*/];
        }
    });
}); };
exports.getAvatarFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var team, imgBuffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, index_1.getPlayerById(req.params.id, true)];
            case 1:
                team = _a.sent();
                if (!team || !team.avatar || !team.avatar.length) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                imgBuffer = Buffer.from(team.avatar, 'base64');
                res.writeHead(200, {
                    'Content-Type': isSvg_1["default"](imgBuffer) ? 'image/svg+xml' : 'image/png',
                    'Content-Length': imgBuffer.length
                });
                res.end(imgBuffer);
                return [2 /*return*/];
        }
    });
}); };
exports.getAvatarURLBySteamID = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, response, player, re, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.params.steamid) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                config = _b.sent();
                response = {
                    custom: '',
                    steam: ''
                };
                return [4 /*yield*/, index_1.getPlayerBySteamId(req.params.steamid, true)];
            case 2:
                player = _b.sent();
                if (player && player.avatar && player.avatar.length && player._id) {
                    response.custom = "http://" + config_1.internalIP + ":" + config.port + "/api/players/avatar/" + player._id;
                }
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                if (config.steamApiKey.length === 0) {
                    return [2 /*return*/, res.json(response)];
                }
                return [4 /*yield*/, node_fetch_1["default"]("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + config.steamApiKey + "&steamids=" + req.params.steamid, {}).then(function (res) { return res.json(); })];
            case 4:
                re = _b.sent();
                if (re.response && re.response.players && re.response.players[0] && re.response.players[0].avatarfull) {
                    response.steam = re.response.players[0].avatarfull;
                }
                return [3 /*break*/, 6];
            case 5:
                _a = _b.sent();
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/, res.json(response)];
        }
    });
}); };
exports.getFields = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fields;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, F.getFields('players')];
            case 1:
                fields = _a.sent();
                return [2 /*return*/, res.json(fields)];
        }
    });
}); };
exports.updateFields = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var newFields;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.body) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, F.updateFields(req.body, 'players')];
            case 1:
                newFields = _a.sent();
                return [2 /*return*/, res.json(newFields)];
        }
    });
}); };