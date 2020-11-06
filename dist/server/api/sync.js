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
exports.checkForConflicts = exports.importDb = exports.exportDatabase = void 0;
var database_1 = __importDefault(require("./../../init/database"));
var players = __importStar(require("./players"));
var teams = __importStar(require("./teams"));
var teamsDb = database_1["default"].teams, playersDb = database_1["default"].players;
function importPlayers(players) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res) {
                    var playerIdList = players.map(function (player) { return ({ _id: player._id }); });
                    playersDb.remove({ $or: playerIdList }, { multi: true }, function (err) {
                        if (err)
                            return res([]);
                        playersDb.insert(players, function (err, newDocs) {
                            if (err)
                                return res([]);
                            return res(newDocs);
                        });
                    });
                })];
        });
    });
}
function importTeams(teams) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res) {
                    var teamIdList = teams.map(function (team) { return ({ _id: team._id }); });
                    teamsDb.remove({ $or: teamIdList }, { multi: true }, function (err) {
                        if (err)
                            return res([]);
                        teamsDb.insert(teams, function (err, newDocs) {
                            if (err)
                                return res([]);
                            return res(newDocs);
                        });
                    });
                })];
        });
    });
}
function exportDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var pl, tm, result, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pl = new Promise(function (res) {
                        playersDb.find({}, function (err, players) {
                            if (err) {
                                return res([]);
                            }
                            return res(players);
                        });
                    });
                    tm = new Promise(function (res) {
                        teamsDb.find({}, function (err, teams) {
                            if (err) {
                                return res([]);
                            }
                            return res(teams);
                        });
                    });
                    return [4 /*yield*/, Promise.all([pl, tm])];
                case 1:
                    result = _a.sent();
                    response = {
                        teams: result[1],
                        players: result[0]
                    };
                    return [2 /*return*/, JSON.stringify(response)];
            }
        });
    });
}
exports.exportDatabase = exportDatabase;
exports.importDb = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                db = req.body;
                if (!db || !db.players || !db.teams)
                    return [2 /*return*/, res.sendStatus(422)];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Promise.all([importPlayers(db.players), importTeams(db.teams)])];
            case 2:
                _b.sent();
                return [2 /*return*/, res.sendStatus(200)];
            case 3:
                _a = _b.sent();
                return [2 /*return*/, res.sendStatus(500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.checkForConflicts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, teamIdList, playerIdList, result, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                db = req.body;
                if (!db || !db.teams || !db.players)
                    return [2 /*return*/, res.sendStatus(422)];
                teamIdList = db.teams.map(function (team) { return ({ _id: team._id }); });
                playerIdList = db.players.map(function (player) { return ({ _id: player._id }); });
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Promise.all([
                        players.getPlayersList({ $or: playerIdList }),
                        teams.getTeamsList({ $or: teamIdList })
                    ])];
            case 2:
                result = _b.sent();
                return [2 /*return*/, res.json({
                        players: result[0].length,
                        teams: result[1].length
                    })];
            case 3:
                _a = _b.sent();
                return [2 /*return*/, res.sendStatus(500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
