"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceLocalMatches = exports.updateRound = exports.reverseSide = exports.updateMatch = exports.getCurrent = exports.deleteMatch = exports.addMatch = exports.updateMatches = exports.setMatches = exports.getMatchById = exports.getActiveGameMatches = exports.getMatches = void 0;
const socket_1 = require("./../../socket");
const database_1 = __importDefault(require("./../../../init/database"));
const teams_1 = require("./../teams");
const v4_1 = __importDefault(require("uuid/v4"));
const __1 = require("..");
const matchesDb = database_1.default.matches;
const getMatches = (query) => {
    return new Promise(res => {
        matchesDb.find(query, (err, matches) => {
            if (err) {
                return res([]);
            }
            return res(matches);
        });
    });
};
exports.getMatches = getMatches;
const getActiveGameMatches = () => {
    const game = __1.customer.game;
    const $or = [{ game }];
    if (game === 'csgo') {
        $or.push({ game: { $exists: false } });
    }
    return (0, exports.getMatches)({ $or });
};
exports.getActiveGameMatches = getActiveGameMatches;
async function getMatchById(id) {
    return new Promise(res => {
        matchesDb.findOne({ id }, (err, match) => {
            if (err) {
                return res(null);
            }
            return res(match);
        });
    });
}
exports.getMatchById = getMatchById;
const setMatches = (matches) => {
    return new Promise(res => {
        matchesDb.remove({}, { multi: true }, err => {
            if (err) {
                return res(null);
            }
            matchesDb.insert(matches, (err, added) => {
                if (err) {
                    return res(null);
                }
                return res(added);
            });
        });
    });
};
exports.setMatches = setMatches;
const updateMatches = async (updateMatches) => {
    const currents = updateMatches.filter(match => match.current);
    if (currents.length > 1) {
        updateMatches = updateMatches.map(match => ({ ...match, current: false }));
    }
    if (currents.length) {
        const left = await (0, teams_1.getTeamById)(currents[0].left.id || '');
        const right = await (0, teams_1.getTeamById)(currents[0].right.id || '');
        if (left && left._id) {
            socket_1.GSI.teams.left = {
                id: left._id,
                name: left.name,
                country: left.country,
                logo: left.logo,
                map_score: currents[0].left.wins,
                extra: left.extra
            };
        }
        if (right && right._id) {
            socket_1.GSI.teams.right = {
                id: right._id,
                name: right.name,
                country: right.country,
                logo: right.logo,
                map_score: currents[0].right.wins,
                extra: right.extra
            };
        }
    }
    const matchesFixed = updateMatches.map(match => {
        if (match.id.length)
            return match;
        match.id = (0, v4_1.default)();
        return match;
    });
    await (0, exports.setMatches)(matchesFixed);
};
exports.updateMatches = updateMatches;
const addMatch = (match) => new Promise(res => {
    if (!match.id) {
        match.id = (0, v4_1.default)();
    }
    match.current = false;
    matchesDb.insert(match, async (err, doc) => {
        if (err)
            return res(null);
        /* if (validateCloudAbility()) {
            await addResource(customer.game as AvailableGames, 'matches', doc);
        } */
        return res(doc);
    });
});
exports.addMatch = addMatch;
const deleteMatch = (id) => new Promise(res => {
    matchesDb.remove({ id }, async (err) => {
        if (err)
            return res(false);
        /* if (validateCloudAbility()) {
            await deleteResource(customer.game as AvailableGames, 'matches', id);
        } */
        return res(true);
    });
});
exports.deleteMatch = deleteMatch;
const getCurrent = async () => {
    const activeGameMatches = await (0, exports.getActiveGameMatches)();
    return activeGameMatches.find(match => match.current);
};
exports.getCurrent = getCurrent;
/*
export const setCurrent = (id: string) =>
    new Promise(res => {
        matchesDb.update({}, { current: false }, { multi: true }, err => {
            if (err) return res(null);
            matchesDb.update({ id }, { current: true }, {}, err => {
                if (err) return res(null);
                return res();
            });
        });
    });
*/
const updateMatch = (match) => new Promise(res => {
    matchesDb.update({ id: match.id }, match, {}, err => {
        if (err)
            return res(false);
        if (!match.current)
            return res(true);
        matchesDb.update({
            $where: function () {
                return (this.current &&
                    this.id !== match.id &&
                    (this.game === match.game ||
                        (!this.game && match.game === 'csgo') ||
                        (this.game === 'csgo' && !match.game)));
            }
        }, { $set: { current: false } }, { multi: true }, async (err) => {
            const left = await (0, teams_1.getTeamById)(match.left.id || '');
            const right = await (0, teams_1.getTeamById)(match.right.id || '');
            if (left && left._id) {
                socket_1.GSI.teams.left = {
                    id: left._id,
                    name: left.name,
                    country: left.country,
                    logo: left.logo,
                    map_score: match.left.wins,
                    extra: left.extra
                };
            }
            if (right && right._id) {
                socket_1.GSI.teams.right = {
                    id: right._id,
                    name: right.name,
                    country: right.country,
                    logo: right.logo,
                    map_score: match.right.wins,
                    extra: right.extra
                };
            }
            /* if (validateCloudAbility()) {
                await updateResource(customer.game as AvailableGames, 'matches', match);
            } */
            if (err)
                return res(false);
            return res(true);
        });
    });
});
exports.updateMatch = updateMatch;
const reverseSide = async () => {
    const io = await socket_1.ioPromise;
    const matches = await (0, exports.getActiveGameMatches)();
    const current = matches.find(match => match.current);
    if (!current)
        return;
    if (current.game === 'csgo' && current.vetos.filter(veto => veto.teamId).length > 0 && !socket_1.GSI.last) {
        return;
    }
    if (current.game === 'csgo') {
        if (current.vetos.filter(veto => veto.teamId).length === 0) {
            current.left = [current.right, (current.right = current.left)][0];
            await (0, exports.updateMatch)(current);
            return io.emit('match', true);
        }
        const currentVetoMap = current.vetos.find(veto => socket_1.GSI.last?.map.name.includes(veto.mapName));
        if (!currentVetoMap)
            return;
        currentVetoMap.reverseSide = !currentVetoMap.reverseSide;
    }
    else {
        const currentVetoMap = current.vetos.find(veto => !veto.mapEnd);
        if (!currentVetoMap) {
            if (current.vetos.length)
                return;
            current.left = [current.right, (current.right = current.left)][0];
        }
        else {
            currentVetoMap.reverseSide = !currentVetoMap.reverseSide;
        }
    }
    await (0, exports.updateMatch)(current);
    io.emit('match', true);
};
exports.reverseSide = reverseSide;
const updateRound = async (game) => {
    const getWinType = (round_win) => {
        switch (round_win) {
            case 'ct_win_defuse':
                return 'defuse';
            case 'ct_win_elimination':
            case 't_win_elimination':
                return 'elimination';
            case 'ct_win_time':
                return 'time';
            case 't_win_bomb':
                return 'bomb';
            default:
                return 'time';
        }
    };
    if (!game || !game.map || game.map.phase !== 'live')
        return;
    const matches = await (0, exports.getActiveGameMatches)();
    const match = matches.find(match => match.current);
    if (!match || match.game !== 'csgo')
        return;
    const mapName = game.map.name.substring(game.map.name.lastIndexOf('/') + 1);
    const veto = match.vetos.find(veto => veto.mapName === mapName && !veto.mapEnd);
    if (!veto || veto.mapEnd)
        return;
    let round = game.map.round;
    if (game.round && game.round.phase !== 'over') {
        round++;
    }
    const roundData = {
        round,
        players: {},
        winner: null,
        win_type: 'bomb'
    };
    if (game.round && game.round.win_team && game.map.round_wins && game.map.round_wins[round]) {
        roundData.winner = game.round.win_team;
        roundData.win_type = getWinType(game.map.round_wins[round]);
    }
    for (const player of game.players) {
        const previousAssists = veto.rounds?.[roundData.round - 2]?.players?.[player.steamid]?.assists || 0;
        const previousDeaths = veto.rounds?.[roundData.round - 2]?.players?.[player.steamid]?.deaths || 0;
        const assists = player.stats.assists - previousAssists;
        const deaths = player.stats.deaths - previousDeaths;
        roundData.players[player.steamid] = {
            kills: player.state.round_kills,
            killshs: player.state.round_killhs,
            damage: player.state.round_totaldmg,
            assists,
            deaths
        };
    }
    if (veto.rounds &&
        veto.rounds[roundData.round - 1] &&
        JSON.stringify(veto.rounds[roundData.round - 1]) === JSON.stringify(roundData))
        return;
    match.vetos = match.vetos.map(veto => {
        if (veto.mapName !== mapName)
            return veto;
        if (!veto.rounds)
            veto.rounds = [];
        veto.rounds[roundData.round - 1] = roundData;
        veto.rounds = veto.rounds.splice(0, roundData.round);
        return veto;
    });
    return (0, exports.updateMatch)(match);
};
exports.updateRound = updateRound;
const replaceLocalMatches = (newMatches, game, existing) => new Promise(res => {
    const or = [
        { game, id: { $nin: existing } },
        { game, id: { $in: newMatches.map(match => match.id) } }
    ];
    if (game === 'csgo') {
        or.push({ game: { $exists: false }, id: { $nin: existing } }, { game: { $exists: false }, id: { $in: newMatches.map(team => team.id) } });
    }
    matchesDb.remove({ $or: or }, { multi: true }, err => {
        if (err) {
            return res(false);
        }
        matchesDb.insert(newMatches, (err, docs) => {
            return res(!err);
        });
    });
});
exports.replaceLocalMatches = replaceLocalMatches;
