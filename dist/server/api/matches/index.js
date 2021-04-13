"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceLocalMatches = exports.updateRound = exports.reverseSide = exports.updateMatch = exports.getCurrent = exports.deleteMatch = exports.addMatch = exports.updateMatches = exports.setMatches = exports.getMatchById = exports.getMatches = void 0;
const socket_1 = require("./../../socket");
const database_1 = __importDefault(require("./../../../init/database"));
const teams_1 = require("./../teams");
const v4_1 = __importDefault(require("uuid/v4"));
const matchesDb = database_1.default.matches;
exports.getMatches = () => {
    return new Promise(res => {
        matchesDb.find({}, (err, matches) => {
            if (err) {
                return res([]);
            }
            return res(matches);
        });
    });
};
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
exports.setMatches = (matches) => {
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
exports.updateMatches = async (updateMatches) => {
    const currents = updateMatches.filter(match => match.current);
    if (currents.length > 1) {
        updateMatches = updateMatches.map(match => ({ ...match, current: false }));
    }
    if (currents.length) {
        const left = await teams_1.getTeamById(currents[0].left.id || '');
        const right = await teams_1.getTeamById(currents[0].right.id || '');
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
        match.id = v4_1.default();
        return match;
    });
    await exports.setMatches(matchesFixed);
};
exports.addMatch = (match) => new Promise(res => {
    if (!match.id) {
        match.id = v4_1.default();
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
exports.deleteMatch = (id) => new Promise(res => {
    matchesDb.remove({ id }, async (err) => {
        if (err)
            return res(false);
        /* if (validateCloudAbility()) {
            await deleteResource(customer.game as AvailableGames, 'matches', id);
        } */
        return res(true);
    });
});
exports.getCurrent = () => new Promise(res => {
    matchesDb.findOne({ current: true }, (err, match) => {
        if (err || !match) {
            return res(null);
        }
        return res(match);
    });
});
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
exports.updateMatch = (match) => new Promise(res => {
    matchesDb.update({ id: match.id }, match, {}, err => {
        if (err)
            return res(false);
        if (!match.current)
            return res(true);
        matchesDb.update({
            $where: function () {
                return this.current && this.id !== match.id;
            }
        }, { $set: { current: false } }, { multi: true }, async (err) => {
            const left = await teams_1.getTeamById(match.left.id || '');
            const right = await teams_1.getTeamById(match.right.id || '');
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
exports.reverseSide = async () => {
    const io = await socket_1.ioPromise;
    const matches = await exports.getMatches();
    const current = matches.find(match => match.current);
    if (!current)
        return;
    if (current.vetos.filter(veto => veto.teamId).length > 0 && !socket_1.GSI.last) {
        return;
    }
    if (current.vetos.filter(veto => veto.teamId).length === 0) {
        current.left = [current.right, (current.right = current.left)][0];
        await exports.updateMatch(current);
        return io.emit('match', true);
    }
    const currentVetoMap = current.vetos.find(veto => socket_1.GSI.last?.map.name.includes(veto.mapName));
    if (!currentVetoMap)
        return;
    currentVetoMap.reverseSide = !currentVetoMap.reverseSide;
    await exports.updateMatch(current);
    io.emit('match', true);
};
exports.updateRound = async (game) => {
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
        roundData.players[player.steamid] = {
            kills: player.state.round_kills,
            killshs: player.state.round_killhs,
            damage: player.state.round_totaldmg
        };
    }
    const matches = await exports.getMatches();
    const match = matches.find(match => match.current);
    if (!match)
        return;
    const mapName = game.map.name.substring(game.map.name.lastIndexOf('/') + 1);
    const veto = match.vetos.find(veto => veto.mapName === mapName && !veto.mapEnd);
    if (!veto || veto.mapEnd)
        return;
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
    return exports.updateMatch(match);
};
exports.replaceLocalMatches = (newMatches, game) => new Promise(res => {
    const or = [{ game }];
    if (game === 'csgo') {
        or.push({ game: { $exists: false } });
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
