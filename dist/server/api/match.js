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
var v4_1 = __importDefault(require("uuid/v4"));
var matchesDb = database_1["default"].matches;
var testmatches = [{
        id: "a",
        left: {
            id: "H427BFDoR9chqgwe",
            wins: 0
        },
        right: {
            id: "XXH5JceBg3miQgBt",
            wins: 0
        },
        current: true,
        matchType: "bo3",
        vetos: [
            { teamId: "H427BFDoR9chqgwe", mapName: "de_overpass", side: "CT", type: "pick", mapEnd: false },
            { teamId: "XXH5JceBg3miQgBt", mapName: "de_mirage", side: "T", type: "pick", mapEnd: false, reverseSide: true },
            { teamId: "H427BFDoR9chqgwe", mapName: "de_inferno", side: "CT", type: "pick", mapEnd: false },
            { teamId: "", mapName: "", side: "NO", type: "pick", mapEnd: false },
            { teamId: "", mapName: "", side: "NO", type: "pick", mapEnd: false },
            { teamId: "", mapName: "", side: "NO", type: "pick", mapEnd: false },
            { teamId: "", mapName: "", side: "NO", type: "pick", mapEnd: false }
        ]
    }];
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
