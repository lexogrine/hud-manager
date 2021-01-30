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
exports.updateFields = exports.getFields = exports.getLogoFile = exports.deleteTeam = exports.updateTeam = exports.addTeam = exports.getTeam = exports.getTeams = void 0;
var database_1 = __importDefault(require("./../../../init/database"));
var config_1 = require("./../config");
var isSvg_1 = __importDefault(require("./../../../src/isSvg"));
var index_1 = require("./index");
var F = __importStar(require("./../fields"));
var teams = database_1["default"].teams;
var players = database_1["default"].players;
exports.getTeams = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var teams, config;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, index_1.getTeamsList({})];
            case 1:
                teams = _a.sent();
                return [4 /*yield*/, config_1.loadConfig()];
            case 2:
                config = _a.sent();
                return [2 /*return*/, res.json(teams.map(function (team) { return (__assign(__assign({}, team), { logo: team.logo && team.logo.length ? "http://" + config_1.internalIP + ":" + config.port + "/api/teams/logo/" + team._id : null })); }))];
        }
    });
}); };
exports.getTeam = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var team;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, index_1.getTeamById(req.params.id, true)];
            case 1:
                team = _a.sent();
                if (!team) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                return [2 /*return*/, res.json(team)];
        }
    });
}); };
exports.addTeam = function (req, res) {
    var newTeam = {
        name: req.body.name,
        shortName: req.body.shortName,
        logo: req.body.logo,
        country: req.body.country,
        extra: req.body.extra
    };
    teams.insert(newTeam, function (err, team) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.json(team);
    });
};
exports.updateTeam = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var team, updated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, index_1.getTeamById(req.params.id, true)];
            case 1:
                team = _a.sent();
                if (!team) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                updated = {
                    name: req.body.name,
                    shortName: req.body.shortName,
                    logo: req.body.logo,
                    country: req.body.country,
                    extra: req.body.extra
                };
                if (req.body.logo === undefined) {
                    updated.logo = team.logo;
                }
                teams.update({ _id: req.params.id }, { $set: updated }, {}, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var team;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    return [2 /*return*/, res.sendStatus(500)];
                                }
                                return [4 /*yield*/, index_1.getTeamById(req.params.id)];
                            case 1:
                                team = _a.sent();
                                return [2 /*return*/, res.json(team)];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); };
exports.deleteTeam = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var team;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, index_1.getTeamById(req.params.id)];
            case 1:
                team = _a.sent();
                if (!team) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                //players.update({team:})
                teams.remove({ _id: req.params.id }, function (err, n) {
                    if (err) {
                        return res.sendStatus(500);
                    }
                    players.update({ team: req.params.id }, { $set: { team: '' } }, { multi: true }, function (err) {
                        if (err) {
                            return res.sendStatus(500);
                        }
                        return res.sendStatus(n ? 200 : 404);
                    });
                });
                return [2 /*return*/];
        }
    });
}); };
exports.getLogoFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var team, imgBuffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    return [2 /*return*/, res.sendStatus(422)];
                }
                return [4 /*yield*/, index_1.getTeamById(req.params.id, true)];
            case 1:
                team = _a.sent();
                if (!team || !team.logo || !team.logo.length) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                imgBuffer = Buffer.from(team.logo, 'base64');
                res.writeHead(200, {
                    'Content-Type': isSvg_1["default"](imgBuffer) ? 'image/svg+xml' : 'image/png',
                    'Content-Length': imgBuffer.length
                });
                res.end(imgBuffer);
                return [2 /*return*/];
        }
    });
}); };
exports.getFields = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fields;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, F.getFields('teams')];
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
                return [4 /*yield*/, F.updateFields(req.body, 'teams')];
            case 1:
                newFields = _a.sent();
                return [2 /*return*/, res.json(newFields)];
        }
    });
}); };
