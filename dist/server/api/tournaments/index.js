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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTournament = exports.createNextMatch = exports.fillNextMatch = exports.bindMatch = exports.updateTournament = exports.getTournament = exports.addTournament = exports.getTournamentByMatchId = exports.createTournament = exports.getTournaments = void 0;
const Formats = __importStar(require("./formats"));
const M = __importStar(require("./../matches"));
const v4_1 = __importDefault(require("uuid/v4"));
const database_1 = __importDefault(require("./../../../init/database"));
const { tournaments } = database_1.default;
const getTournaments = () => new Promise(res => {
    tournaments.find({}, (err, docs) => {
        if (err)
            return res([]);
        return res(docs);
    });
});
exports.getTournaments = getTournaments;
const createTournament = (type, teams) => {
    const tournament = {
        _id: '',
        name: '',
        logo: '',
        matchups: [],
        autoCreate: true
    };
    switch (type) {
        case 'se':
            tournament.matchups = Formats.createSEBracket(teams);
            break;
        case 'de':
            tournament.matchups = Formats.createDEBracket(teams);
            break;
        default:
            break;
    }
    return tournament;
};
exports.createTournament = createTournament;
const getTournamentByMatchId = async (matchId) => {
    const tournaments = await exports.getTournaments();
    const tournament = tournaments.find(trnm => !!trnm.matchups.find(matchup => matchup.matchId === matchId));
    return tournament || null;
};
exports.getTournamentByMatchId = getTournamentByMatchId;
const addTournament = (tournament) => new Promise(res => {
    tournaments.insert(tournament, (err, newTournament) => {
        if (err)
            return res(null);
        return res(newTournament);
    });
});
exports.addTournament = addTournament;
const getTournament = (tournamentId) => new Promise(res => {
    tournaments.findOne({ _id: tournamentId }, (err, tournament) => {
        if (err || !tournament)
            return res(null);
        return res(tournament);
    });
});
exports.getTournament = getTournament;
const updateTournament = (tournament) => new Promise(res => {
    tournaments.update({ _id: tournament._id }, tournament, {}, err => {
        if (err)
            return res(null);
        return res(tournament);
    });
});
exports.updateTournament = updateTournament;
const bindMatch = async (matchId, matchupId, tournamentId) => {
    const tournament = await exports.getTournament(tournamentId);
    if (!tournament)
        return null;
    const matchup = tournament.matchups.find(matchup => matchup._id === matchupId);
    if (!matchup)
        return null;
    matchup.matchId = matchId;
    return await exports.updateTournament(tournament);
};
exports.bindMatch = bindMatch;
const fillNextMatch = (matchId, type) => new Promise(res => {
    const maxWins = (type) => {
        switch (type) {
            case 'bo1':
                return 1;
            case 'bo3':
                return 2;
            case 'bo5':
                return 3;
            case 'bo7':
                return 4;
            case 'bo9':
                return 5;
            default:
                return 2;
        }
    };
    tournaments.findOne({
        $where: function () {
            return !!this.matchups.find((matchup) => matchup.matchId === matchId);
        }
    }, async (err, tournament) => {
        if (err || !tournament)
            return res(null);
        const matchup = tournament.matchups.find(matchup => matchup.matchId === matchId);
        if (!matchup || (!matchup.winner_to && type === 'winner') || (!matchup.loser_to && type === 'loser'))
            return res(null);
        const nextMatchup = tournament.matchups.find(next => (next._id === matchup.winner_to && type === 'winner') ||
            (next._id === matchup.loser_to && type === 'loser'));
        if (!nextMatchup)
            return res(null);
        const match = await M.getMatchById(matchId);
        if (!match)
            return res(null);
        const winsRequired = maxWins(match.matchType);
        if (match.left.wins !== winsRequired && match.right.wins !== winsRequired)
            return res(null);
        const winnerId = match.left.wins > match.right.wins ? match.left.id : match.right.id;
        const loserId = match.left.wins > match.right.wins ? match.right.id : match.left.id;
        if (!nextMatchup.matchId) {
            const newMatch = {
                id: v4_1.default(),
                current: false,
                left: { id: type === 'winner' ? winnerId : loserId, wins: 0 },
                right: { id: null, wins: 0 },
                matchType: 'bo1',
                vetos: [],
                startTime: 0,
                game: 'csgo'
            };
            for (let i = 0; i < 7; i++) {
                newMatch.vetos.push({
                    teamId: '',
                    mapName: '',
                    side: 'NO',
                    type: 'pick',
                    mapEnd: false,
                    reverseSide: false
                });
            }
            const resp = await M.addMatch(newMatch);
            if (!resp)
                return res(null);
            nextMatchup.matchId = newMatch.id;
            await exports.updateTournament(tournament);
        }
        const nextMatch = await M.getMatchById(nextMatchup.matchId);
        if (!nextMatch)
            return res(null);
        const teamIds = [nextMatch.left.id, nextMatch.right.id];
        if ((teamIds.includes(winnerId) && type === 'winner') ||
            (teamIds.includes(loserId) && type === 'loser'))
            return res(nextMatch);
        if (!nextMatch.left.id) {
            nextMatch.left.id = type === 'winner' ? winnerId : loserId;
        }
        else if (!nextMatch.right.id) {
            nextMatch.right.id = type === 'winner' ? winnerId : loserId;
        }
        else {
            return res(null);
        }
        await M.updateMatch(nextMatch);
        return res(nextMatch);
    });
});
exports.fillNextMatch = fillNextMatch;
const createNextMatch = async (matchId) => {
    try {
        await Promise.all([exports.fillNextMatch(matchId, 'winner'), exports.fillNextMatch(matchId, 'loser')]);
    }
    catch {
        return;
    }
};
exports.createNextMatch = createNextMatch;
const deleteTournament = (tournamentId) => new Promise(res => {
    tournaments.remove({ _id: tournamentId }, err => {
        if (err)
            return res(null);
        return res(true);
    });
});
exports.deleteTournament = deleteTournament;
