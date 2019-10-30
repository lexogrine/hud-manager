"use strict";
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
exports.__esModule = true;
var sockets_1 = require("./../sockets");
var teams_1 = require("./teams");
exports.match = {
    left: {
        id: null,
        wins: 0
    },
    right: {
        id: null,
        wins: 0
    },
    matchType: 'bo1',
    vetos: []
};
exports.getMatch = function (req, res) {
    return res.json(exports.match);
};
exports.getMatchV2 = function () {
    return exports.match;
};
exports.updateMatch = function (updateMatch) { return __awaiter(void 0, void 0, void 0, function () {
    var left, right;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!updateMatch.left.id) return [3 /*break*/, 2];
                return [4 /*yield*/, teams_1.getTeamById(updateMatch.left.id)];
            case 1:
                left = _a.sent();
                if (left && left._id) {
                    sockets_1.GSI.setTeamOne({ id: left._id, name: left.name, country: left.country, logo: left.logo, map_score: updateMatch.left.wins });
                }
                _a.label = 2;
            case 2:
                if (!updateMatch.right.id) return [3 /*break*/, 4];
                return [4 /*yield*/, teams_1.getTeamById(updateMatch.right.id)];
            case 3:
                right = _a.sent();
                if (right && right._id) {
                    sockets_1.GSI.setTeamTwo({ id: right._id, name: right.name, country: right.country, logo: right.logo, map_score: updateMatch.right.wins });
                }
                _a.label = 4;
            case 4:
                exports.match.left = {
                    id: updateMatch.left.id,
                    wins: updateMatch.left.wins
                };
                exports.match.right = {
                    id: updateMatch.right.id,
                    wins: updateMatch.right.wins
                };
                exports.match.matchType = updateMatch.matchType;
                exports.match.vetos = updateMatch.vetos;
                return [2 /*return*/];
        }
    });
}); };
exports.setMatch = function (req, res) {
    /*match.left = {
        id: req.body.left.id,
        wins: req.body.left.wins
    };
    match.right = {
        id: req.body.right.id,
        wins: req.body.right.wins
    };
    match.matchType = req.body.matchType;
    match.vetos = req.body.vetos;*/
    exports.updateMatch(req.body);
    return res.json(exports.match);
};
