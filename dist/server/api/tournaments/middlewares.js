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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var T = __importStar(require("./"));
exports.getTournaments = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tournaments;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, T.getTournaments()];
            case 1:
                tournaments = _a.sent();
                return [2 /*return*/, res.json(tournaments)];
        }
    });
}); };
exports.addTournament = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, logo, teams, type, tournament, tournamentWithId;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, logo = _a.logo, teams = _a.teams, type = _a.type;
                tournament = T.createTournament(type, teams);
                tournament.name = name;
                tournament.logo = logo;
                delete tournament._id;
                return [4 /*yield*/, T.addTournament(tournament)];
            case 1:
                tournamentWithId = _b.sent();
                if (!tournamentWithId)
                    return [2 /*return*/, res.sendStatus(500)];
                return [2 /*return*/, res.json(tournamentWithId)];
        }
    });
}); };
exports.bindMatchToMatchup = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tournamentId, _a, matchId, matchupId, tournament;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                tournamentId = req.params.id;
                _a = req.body, matchId = _a.matchId, matchupId = _a.matchupId;
                return [4 /*yield*/, T.bindMatch(matchId, matchupId, tournamentId)];
            case 1:
                tournament = _b.sent();
                if (!tournament)
                    return [2 /*return*/, res.sendStatus(500)];
                return [2 /*return*/, res.sendStatus(200)];
        }
    });
}); };
exports.updateTournament = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, logo, tournament, newTournament;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, logo = _a.logo;
                return [4 /*yield*/, T.getTournament(req.params.id)];
            case 1:
                tournament = _b.sent();
                if (!tournament)
                    return [2 /*return*/, res.sendStatus(404)];
                tournament.name = name;
                if (logo) {
                    tournament.logo = logo;
                }
                return [4 /*yield*/, T.updateTournament(tournament)];
            case 2:
                newTournament = _b.sent();
                return [2 /*return*/, res.sendStatus(newTournament ? 200 : 500)];
        }
    });
}); };
exports.deleteTournament = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var del;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, T.deleteTournament(req.params.id)];
            case 1:
                del = _a.sent();
                return [2 /*return*/, res.sendStatus(del ? 200 : 500)];
        }
    });
}); };
