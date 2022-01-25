"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceLocalPlayers = exports.addPlayers = exports.getPlayersList = exports.getPlayerBySteamId = exports.getPlayerById = void 0;
const database_1 = require("./../../../init/database");
async function getPlayerById(id, avatar = false) {
    return new Promise(res => {
        if (!database_1.databaseContext.databases.players)
            return res(null);
        database_1.databaseContext.databases.players.findOne({ _id: id }, (err, player) => {
            if (err) {
                return res(null);
            }
            if (!avatar && player && player.avatar)
                player.avatar = '';
            return res(player);
        });
    });
}
exports.getPlayerById = getPlayerById;
async function getPlayerBySteamId(steamid, avatar = false) {
    return new Promise(res => {
        if (!database_1.databaseContext.databases.players)
            return res(null);
        database_1.databaseContext.databases.players.findOne({ steamid }, (err, player) => {
            if (err) {
                return res(null);
            }
            if (!avatar && player && player.avatar)
                player.avatar = '';
            return res(player);
        });
    });
}
exports.getPlayerBySteamId = getPlayerBySteamId;
const getPlayersList = (query) => new Promise(res => {
    if (!database_1.databaseContext.databases.players)
        return res([]);
    database_1.databaseContext.databases.players.find(query, (err, players) => {
        if (err) {
            return res([]);
        }
        return res([...players].sort((a, b) => (a.username > b.username ? 1 : -1)));
    });
});
exports.getPlayersList = getPlayersList;
const addPlayers = (newPlayers) => {
    return new Promise(res => {
        if (!database_1.databaseContext.databases.players)
            return res(null);
        database_1.databaseContext.databases.players.insert(newPlayers, (err, docs) => {
            if (err)
                return res(null);
            return res(docs);
        });
    });
};
exports.addPlayers = addPlayers;
const replaceLocalPlayers = (newPlayers, game, existing) => new Promise(res => {
    if (!database_1.databaseContext.databases.players)
        return res(false);
    const or = [
        { game, _id: { $nin: existing } },
        { game, _id: { $in: newPlayers.map(player => player._id) } }
    ];
    if (game === 'csgo') {
        or.push({ game: { $exists: false }, _id: { $nin: existing } }, { game: { $exists: false }, _id: { $in: newPlayers.map(player => player._id) } });
    }
    database_1.databaseContext.databases.players.remove({ $or: or }, { multi: true }, (err, n) => {
        if (err) {
            return res(false);
        }
        database_1.databaseContext.databases.players.insert(newPlayers, (err, docs) => {
            return res(!err);
        });
    });
});
exports.replaceLocalPlayers = replaceLocalPlayers;
