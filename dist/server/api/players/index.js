"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportPlayers = exports.replaceLocalPlayers = exports.addPlayers = exports.getPlayersList = exports.getPlayerBySteamId = exports.getPlayerById = void 0;
const database_1 = require("./../../../init/database");
const exceljs_1 = __importDefault(require("exceljs"));
const __1 = require("..");
const teams_1 = require("../teams");
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
const exportPlayers = async (file) => {
    const game = __1.customer.game;
    const $or = [{ game }];
    if (game === 'csgo') {
        $or.push({ game: { $exists: false } });
    }
    const players = await (0, exports.getPlayersList)({ $or });
    const teams = await (0, teams_1.getTeamsList)({ $or });
    const usedTeams = teams.filter(team => players.find(player => player.team === team._id));
    const workbook = new exceljs_1.default.Workbook();
    const sheet = workbook.addWorksheet('Players');
    sheet.addRow(['Username', 'SteamID', 'First Name', 'Last Name', 'Country Code', 'Team Name', 'Avatar']);
    sheet.properties.defaultColWidth = 20;
    sheet.getColumn(7).width = 18;
    for (const player of players) {
        const team = usedTeams.find(team => team._id === player.team);
        const row = sheet.addRow([
            player.username,
            player.steamid,
            player.firstName,
            player.lastName,
            player.country,
            team?.name
        ]);
        if (player.avatar) {
            row.height = 100;
            const buffer = Buffer.from(player.avatar, 'base64');
            const avatarId = workbook.addImage({
                buffer,
                extension: 'png',
            });
            sheet.addImage(avatarId, {
                tl: { row: row.number - 1, col: 6 },
                ext: { width: 100, height: 100 }
            });
        }
    }
    workbook.xlsx.writeFile(file);
};
exports.exportPlayers = exportPlayers;
