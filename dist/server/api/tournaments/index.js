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
exports.deleteTournament = exports.createNextMatch = exports.fillNextMatches = exports.bindMatch = exports.updateTournament = exports.getTournament = exports.addTournament = exports.getTournamentByMatchId = exports.createTournament = exports.getTournaments = exports.parseLegacyTournament = exports.parseLegacyMatchups = void 0;
const Formats = __importStar(require("./formats"));
const M = __importStar(require("./../matches"));
const v4_1 = __importDefault(require("uuid/v4"));
const database_1 = require("./../../../init/database");
const __1 = require("..");
const parseLegacyMatchups = (matchup) => {
    if ('stage' in matchup)
        return matchup;
    const newMatchup = {
        _id: matchup._id,
        loser_to: matchup.loser_to,
        winner_to: matchup.winner_to,
        label: matchup.label,
        stage: null,
        matchId: matchup.matchId,
        parents: matchup.parents.map(parent => (0, exports.parseLegacyMatchups)(parent))
    };
    return newMatchup;
};
exports.parseLegacyMatchups = parseLegacyMatchups;
const parseLegacyTournament = (tournament) => {
    if (!('matchups' in tournament))
        return tournament;
    const newTournament = {
        _id: tournament._id,
        name: tournament.name,
        logo: tournament.logo,
        groups: [],
        playoffs: {
            teams: 16,
            type: 'double',
            participants: [],
            phases: 0,
            matchups: tournament.matchups.map(matchup => (0, exports.parseLegacyMatchups)(matchup))
        },
        autoCreate: tournament.autoCreate
    };
    return newTournament;
};
exports.parseLegacyTournament = parseLegacyTournament;
const getTournaments = (opts = {}) => new Promise(res => {
    if (!database_1.databaseContext.databases.tournaments)
        return res([]);
    database_1.databaseContext.databases.tournaments.find(opts, (err, docs) => {
        if (err)
            return res([]);
        return res(docs.map(doc => (0, exports.parseLegacyTournament)(doc)));
    });
});
exports.getTournaments = getTournaments;
const createTournament = (type, teams, groupType, groupTeams, phases, groupPhases, participants, groupParticipants) => {
    const tournament = {
        _id: '',
        name: '',
        logo: '',
        groups: [],
        game: __1.customer.game,
        playoffs: {
            type: 'single',
            teams,
            phases: 0,
            participants: [],
            matchups: []
        },
        autoCreate: true
    };
    switch (type) {
        case 'single':
            tournament.playoffs.matchups = Formats.createSEBracket(teams);
            break;
        case 'double':
            tournament.playoffs.type = 'double';
            tournament.playoffs.matchups = Formats.createDEBracket(teams);
            break;
        case 'swiss':
            tournament.playoffs.type = 'swiss';
            tournament.playoffs.matchups = Formats.createSSBracket(participants?.length || 8, phases || 5);
            tournament.playoffs.phases = phases || 5;
            tournament.playoffs.participants = participants || [];
            break;
        default:
            break;
    }
    const amountOfGroupTeams = groupTeams || groupParticipants?.length;
    if (groupType && amountOfGroupTeams) {
        tournament.groups.push({
            participants: [],
            type: 'single',
            matchups: [],
            teams: amountOfGroupTeams,
            phases: 0
        });
        switch (groupType) {
            case 'single':
                tournament.groups[0].matchups = Formats.createSEBracket(amountOfGroupTeams);
                break;
            case 'double':
                tournament.groups[0].type = 'double';
                tournament.groups[0].matchups = Formats.createDEBracket(amountOfGroupTeams);
                break;
            case 'swiss':
                tournament.groups[0].type = 'swiss';
                tournament.groups[0].matchups = Formats.createSSBracket(groupParticipants?.length || 8, groupPhases || 5);
                tournament.groups[0].phases = groupPhases || 5;
                tournament.groups[0].participants = groupParticipants || [];
                break;
            default:
                break;
        }
    }
    return tournament;
};
exports.createTournament = createTournament;
const getMatchupsFromTournament = (tournament) => [
    ...tournament.playoffs.matchups,
    ...tournament.groups.map(group => group.matchups).flat()
];
const getTournamentByMatchId = async (matchId) => {
    const tournaments = await (0, exports.getTournaments)();
    const tournament = tournaments.find(tournament => getMatchupsFromTournament(tournament).find(matchup => matchup.matchId === matchId));
    return tournament || null;
};
exports.getTournamentByMatchId = getTournamentByMatchId;
const addTournament = (tournament) => new Promise(res => {
    if (!database_1.databaseContext.databases.tournaments)
        return res(null);
    database_1.databaseContext.databases.tournaments.insert(tournament, (err, newTournament) => {
        if (err)
            return res(null);
        return res(newTournament);
    });
});
exports.addTournament = addTournament;
const getTournament = (tournamentId) => new Promise(res => {
    if (!database_1.databaseContext.databases.tournaments)
        return res(null);
    database_1.databaseContext.databases.tournaments.findOne({ _id: tournamentId }, (err, tournament) => {
        if (err || !tournament)
            return res(null);
        return res((0, exports.parseLegacyTournament)(tournament));
    });
});
exports.getTournament = getTournament;
const updateTournament = (tournament) => new Promise(res => {
    if (!database_1.databaseContext.databases.tournaments)
        return res(null);
    database_1.databaseContext.databases.tournaments.update({ _id: tournament._id }, tournament, {}, err => {
        if (err)
            return res(null);
        return res(tournament);
    });
});
exports.updateTournament = updateTournament;
const bindMatch = async (matchId, matchupId, tournamentId) => {
    const tournament = await (0, exports.getTournament)(tournamentId);
    if (!tournament)
        return null;
    const matchup = getMatchupsFromTournament(tournament).find(matchup => matchup._id === matchupId);
    if (!matchup)
        return null;
    matchup.matchId = matchId;
    return await (0, exports.updateTournament)(tournament);
};
exports.bindMatch = bindMatch;
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
const fillNextMatches = async (matchId) => {
    const match = await M.getMatchById(matchId);
    const tournament = await (0, exports.getTournamentByMatchId)(matchId);
    if (!tournament || !match)
        return null;
    const winsRequired = maxWins(match.matchType);
    if (match.left.wins !== winsRequired && match.right.wins !== winsRequired)
        return null;
    const currentMatchup = getMatchupsFromTournament(tournament).find(matchup => matchup.matchId === matchId);
    if (!currentMatchup)
        return null;
    const losersNextMatchup = getMatchupsFromTournament(tournament).find(matchup => matchup._id === currentMatchup.loser_to);
    const winnersNextMatchup = getMatchupsFromTournament(tournament).find(matchup => matchup._id === currentMatchup.winner_to);
    const winnerId = match.left.wins > match.right.wins ? match.left.id : match.right.id;
    const loserId = match.left.wins > match.right.wins ? match.right.id : match.left.id;
    if (losersNextMatchup) {
        let nextMatch = losersNextMatchup.matchId ? (await M.getMatchById(losersNextMatchup.matchId)) || null : null;
        if (!nextMatch) {
            const newMatch = {
                id: (0, v4_1.default)(),
                current: false,
                left: { id: null, wins: 0 },
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
            const response = await M.addMatch(newMatch);
            if (!response)
                return null;
            losersNextMatchup.matchId = response.id;
            nextMatch = response;
        }
        if (nextMatch.left.id !== loserId && nextMatch.right.id !== loserId) {
            if (!nextMatch.left.id) {
                nextMatch.left.id = loserId;
            }
            else if (!nextMatch.right.id) {
                nextMatch.right.id = loserId;
            }
            else {
                return null;
            }
        }
        await M.updateMatch(nextMatch);
    }
    if (winnersNextMatchup) {
        let nextMatch = winnersNextMatchup.matchId ? (await M.getMatchById(winnersNextMatchup.matchId)) || null : null;
        if (!nextMatch) {
            const newMatch = {
                id: (0, v4_1.default)(),
                current: false,
                left: { id: null, wins: 0 },
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
            const response = await M.addMatch(newMatch);
            if (!response)
                return null;
            winnersNextMatchup.matchId = response.id;
            nextMatch = response;
        }
        if (nextMatch.left.id !== winnerId && nextMatch.right.id !== winnerId) {
            if (!nextMatch.left.id) {
                nextMatch.left.id = winnerId;
            }
            else if (!nextMatch.right.id) {
                nextMatch.right.id = winnerId;
            }
            else {
                return null;
            }
        }
        await M.updateMatch(nextMatch);
    }
    await (0, exports.updateTournament)(tournament);
};
exports.fillNextMatches = fillNextMatches;
const createNextMatch = async (matchId) => {
    try {
        await (0, exports.fillNextMatches)(matchId);
        //await Promise.all([fillNextMatch(matchId, 'winner'), fillNextMatch(matchId, 'loser')]);
    }
    catch {
        return;
    }
};
exports.createNextMatch = createNextMatch;
const deleteTournament = (tournamentId) => new Promise(res => {
    if (!database_1.databaseContext.databases.tournaments)
        return res(null);
    database_1.databaseContext.databases.tournaments.remove({ _id: tournamentId }, err => {
        if (err)
            return res(null);
        return res(true);
    });
});
exports.deleteTournament = deleteTournament;
