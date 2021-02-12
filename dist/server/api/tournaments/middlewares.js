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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTournament = exports.updateTournament = exports.bindMatchToMatchup = exports.addTournament = exports.getTournaments = exports.getCurrentTournament = void 0;
const T = __importStar(require("./"));
const matches_1 = require("../matches");
exports.getCurrentTournament = async (req, res) => {
    const matches = await matches_1.getMatches();
    const current = matches.find(match => match.current);
    if (!current) {
        return res.json({ tournament: null });
    }
    const tournament = await T.getTournamentByMatchId(current.id);
    return res.json({ tournament: tournament || null });
};
exports.getTournaments = async (req, res) => {
    const tournaments = await T.getTournaments();
    return res.json(tournaments);
};
exports.addTournament = async (req, res) => {
    const { name, logo, teams, type } = req.body;
    const tournament = T.createTournament(type, teams);
    tournament.name = name;
    tournament.logo = logo;
    delete tournament._id;
    const tournamentWithId = await T.addTournament(tournament);
    if (!tournamentWithId)
        return res.sendStatus(500);
    return res.json(tournamentWithId);
};
exports.bindMatchToMatchup = async (req, res) => {
    const tournamentId = req.params.id;
    const { matchId, matchupId } = req.body;
    const tournament = await T.bindMatch(matchId, matchupId, tournamentId);
    if (!tournament)
        return res.sendStatus(500);
    return res.sendStatus(200);
};
exports.updateTournament = async (req, res) => {
    const { name, logo } = req.body;
    const tournament = await T.getTournament(req.params.id);
    if (!tournament)
        return res.sendStatus(404);
    tournament.name = name;
    if (logo) {
        tournament.logo = logo;
    }
    const newTournament = await T.updateTournament(tournament);
    return res.sendStatus(newTournament ? 200 : 500);
};
exports.deleteTournament = async (req, res) => {
    const del = await T.deleteTournament(req.params.id);
    return res.sendStatus(del ? 200 : 500);
};
