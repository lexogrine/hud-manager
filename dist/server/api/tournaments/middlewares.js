"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceLocalTournaments = exports.deleteTournament = exports.updateTournament = exports.bindMatchToMatchup = exports.addTournament = exports.getTournaments = exports.getCurrentTournament = void 0;
const T = __importStar(require("./"));
const database_1 = require("./../../../init/database");
const matches_1 = require("../matches");
const __1 = require("..");
const cloud_1 = require("../cloud");
const getCurrentTournament = async (req, res) => {
    const matches = await (0, matches_1.getActiveGameMatches)();
    const current = matches.find(match => match.current);
    if (!current) {
        return res.json({ tournament: null });
    }
    const tournament = await T.getTournamentByMatchId(current.id);
    return res.json({ tournament: tournament || null });
};
exports.getCurrentTournament = getCurrentTournament;
const getTournaments = async (req, res) => {
    const game = __1.customer.game;
    const $or = [{ game }];
    if (game === 'csgo') {
        $or.push({ game: { $exists: false } });
    }
    const tournaments = await T.getTournaments({ $or });
    return res.json(tournaments);
};
exports.getTournaments = getTournaments;
const addTournament = async (req, res) => {
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)('tournaments')) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    const { name, logo, playoffTeams, playoffType, groupType, groupTeams, phases, groupPhases, participants, groupParticipants } = req.body;
    const tournament = T.createTournament(playoffType, Number(playoffTeams), groupType, Number(groupTeams), Number(phases), Number(groupPhases), participants, groupParticipants);
    tournament.name = name;
    tournament.logo = logo;
    // @ts-ignore
    delete tournament._id;
    const tournamentWithId = await T.addTournament(tournament);
    if (cloudStatus) {
        await (0, cloud_1.addResource)(__1.customer.game, 'tournaments', tournamentWithId);
    }
    else {
        (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['tournaments']);
    }
    if (!tournamentWithId)
        return res.sendStatus(500);
    return res.json(tournamentWithId);
};
exports.addTournament = addTournament;
const bindMatchToMatchup = async (req, res) => {
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)('tournaments')) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    const tournamentId = req.params.id;
    const { matchId, matchupId } = req.body;
    const tournament = await T.bindMatch(matchId, matchupId, tournamentId);
    if (!tournament)
        return res.sendStatus(500);
    if (cloudStatus) {
        await (0, cloud_1.updateResource)(__1.customer.game, 'tournaments', tournament);
    }
    else {
        (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['tournaments']);
    }
    return res.sendStatus(200);
};
exports.bindMatchToMatchup = bindMatchToMatchup;
const updateTournament = async (req, res) => {
    const { name, logo } = req.body;
    const tournament = await T.getTournament(req.params.id);
    if (!tournament)
        return res.sendStatus(404);
    tournament.name = name;
    if (logo) {
        tournament.logo = logo;
    }
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)('tournaments')) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    const newTournament = await T.updateTournament(tournament);
    if (cloudStatus) {
        await (0, cloud_1.updateResource)(__1.customer.game, 'tournaments', { ...newTournament, _id: req.params.id });
    }
    else {
        (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['tournaments']);
    }
    return res.sendStatus(newTournament ? 200 : 500);
};
exports.updateTournament = updateTournament;
const deleteTournament = async (req, res) => {
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)('tournaments')) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    const del = await T.deleteTournament(req.params.id);
    if (cloudStatus) {
        await (0, cloud_1.deleteResource)(__1.customer.game, 'tournaments', req.params.id);
    }
    else {
        (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['tournaments']);
    }
    return res.sendStatus(del ? 200 : 500);
};
exports.deleteTournament = deleteTournament;
const replaceLocalTournaments = (newTournaments, game, existing) => new Promise(res => {
    if (!database_1.databaseContext.databases.tournaments)
        return res(false);
    const or = [
        { game, _id: { $nin: existing } },
        { game, _id: { $in: newTournaments.map(tournament => tournament._id) } }
    ];
    if (game === 'csgo') {
        or.push({ game: { $exists: false }, id: { $nin: existing } }, { game: { $exists: false }, id: { $in: newTournaments.map(tournament => tournament._id) } });
    }
    database_1.databaseContext.databases.tournaments.remove({ $or: or }, { multi: true }, err => {
        if (err) {
            return res(false);
        }
        database_1.databaseContext.databases.tournaments.insert(newTournaments, (err, docs) => {
            return res(!err);
        });
    });
});
exports.replaceLocalTournaments = replaceLocalTournaments;
