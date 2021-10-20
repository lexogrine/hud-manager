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
exports.updateFields = exports.getFields = exports.getAvatarURLBySteamID = exports.getAvatarFile = exports.deletePlayer = exports.addPlayersWithExcel = exports.addPlayer = exports.updatePlayer = exports.getPlayer = exports.getPlayers = void 0;
const database_1 = __importDefault(require("./../../../init/database"));
const interfaces_1 = require("../../../types/interfaces");
const config_1 = require("./../config");
const node_fetch_1 = __importDefault(require("node-fetch"));
const isSvg_1 = __importDefault(require("./../../../src/isSvg"));
const index_1 = require("./index");
const F = __importStar(require("./../fields"));
const __1 = require("..");
const cloud_1 = require("../cloud");
const exceljs_1 = require("exceljs");
const teams_1 = require("../teams");
const players = database_1.default.players;
const getPlayers = async (req, res) => {
    const game = __1.customer.game;
    const $or = [{ game }];
    if (game === 'csgo') {
        $or.push({ game: { $exists: false } });
    }
    if (req.query.steamids && typeof req.query.steamids === 'string') {
        const steamids = req.query.steamids.split(';');
        const steamidOr = { $in: steamids };
        for (const $orVariant of $or) {
            $orVariant.steamid = steamidOr;
        }
    }
    const players = await (0, index_1.getPlayersList)({ $or });
    const config = await (0, config_1.loadConfig)();
    return res.json(players.map(player => ({
        ...player,
        avatar: player.avatar && player.avatar.length
            ? `http://${config_1.internalIP}:${config.port}/api/players/avatar/${player._id}`
            : null
    })));
};
exports.getPlayers = getPlayers;
const getPlayer = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const player = await (0, index_1.getPlayerById)(req.params.id);
    if (!player) {
        return res.sendStatus(404);
    }
    return res.json(player);
};
exports.getPlayer = getPlayer;
const updatePlayer = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const player = await (0, index_1.getPlayerById)(req.params.id, true);
    if (!player) {
        return res.sendStatus(404);
    }
    const updated = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        avatar: req.body.avatar,
        game: __1.customer.game,
        country: req.body.country,
        steamid: req.body.steamid,
        team: req.body.team,
        extra: req.body.extra
    };
    if (req.body.avatar === undefined) {
        updated.avatar = player.avatar;
    }
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)()) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    players.update({ _id: req.params.id }, { $set: updated }, {}, async (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (cloudStatus) {
            await (0, cloud_1.updateResource)(__1.customer.game, 'players', { ...updated, _id: req.params.id });
        }
        else {
            (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['players']);
        }
        const player = await (0, index_1.getPlayerById)(req.params.id);
        return res.json(player);
    });
};
exports.updatePlayer = updatePlayer;
const addPlayer = async (req, res) => {
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)()) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    const newPlayer = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        avatar: req.body.avatar,
        country: req.body.country,
        steamid: req.body.steamid,
        team: req.body.team,
        extra: req.body.extra,
        game: __1.customer.game
    };
    const result = await (0, index_1.addPlayers)([newPlayer]);
    if (!result || !result.length) {
        return res.sendStatus(500);
    }
    if (cloudStatus) {
        await (0, cloud_1.addResource)(__1.customer.game, 'players', result[0]);
    }
    else {
        (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['players']);
    }
    return res.json(result[0]);
};
exports.addPlayer = addPlayer;
const addPlayersWithExcel = async (req, res) => {
    const fileBase64 = req.body.data;
    const game = __1.customer.game;
    if (!interfaces_1.availableGames.includes(game))
        return res.sendStatus(422);
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)()) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    const file = Buffer.from(fileBase64, 'base64');
    try {
        const workbook = new exceljs_1.Workbook();
        await workbook.xlsx.load(file);
        const worksheet = workbook.worksheets[0];
        if (!worksheet)
            return res.sendStatus(422);
        const players = [];
        const $or = [{ game }];
        if (game === 'csgo') {
            $or.push({ game: { $exists: false } });
        }
        const teams = await (0, teams_1.getTeamsList)({ $or });
        worksheet.eachRow(row => {
            const username = row.getCell('A').value?.toString?.() || '';
            const steamid = row.getCell('B').value?.toString?.() || '';
            if (!username || username === 'Username' || !steamid) {
                return;
            }
            const firstName = row.getCell('C').value?.toString?.() || '';
            const lastName = row.getCell('D').value?.toString?.() || '';
            const country = row.getCell('E').value?.toString?.() || '';
            const teamName = row.getCell('F').value?.toString?.() || '';
            const team = teams.find(team => team.name === teamName && (team.game === game || (game === 'csgo' && !team.game)));
            const teamId = team?._id || '';
            players.push({
                username,
                steamid,
                firstName,
                lastName,
                country,
                team: teamId,
                extra: {},
                avatar: ''
            });
        });
        const result = await (0, index_1.addPlayers)(players);
        if (!result) {
            return res.sendStatus(503);
        }
        if (cloudStatus) {
            await (0, cloud_1.addResource)(__1.customer.game, 'players', result);
        }
        else {
            (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['players']);
        }
        return res.json({ message: `Added ${result.length} players` });
    }
    catch {
        return res.sendStatus(500);
    }
};
exports.addPlayersWithExcel = addPlayersWithExcel;
const deletePlayer = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    /*
    const player = await getPlayerById(req.params.id);
    if (!player) {
        return res.sendStatus(404);
    }
    */
    const ids = req.params.id.split(';');
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)()) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    players.remove({ _id: { $in: ids } }, { multi: true }, async (err, n) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (cloudStatus) {
            await (0, cloud_1.deleteResource)(__1.customer.game, 'players', ids);
        }
        else {
            (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['players']);
        }
        return res.sendStatus(n ? 200 : 404);
    });
};
exports.deletePlayer = deletePlayer;
const getAvatarFile = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const team = await (0, index_1.getPlayerById)(req.params.id, true);
    if (!team || !team.avatar || !team.avatar.length) {
        return res.sendStatus(404);
    }
    const imgBuffer = Buffer.from(team.avatar, 'base64');
    res.writeHead(200, {
        'Content-Type': (0, isSvg_1.default)(imgBuffer) ? 'image/svg+xml' : 'image/png',
        'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
};
exports.getAvatarFile = getAvatarFile;
const getAvatarURLBySteamID = async (req, res) => {
    if (!req.params.steamid) {
        return res.sendStatus(422);
    }
    const config = await (0, config_1.loadConfig)();
    const response = {
        custom: '',
        steam: ''
    };
    const player = await (0, index_1.getPlayerBySteamId)(req.params.steamid, true);
    if (player && player.avatar && player.avatar.length && player._id) {
        response.custom = `http://${config_1.internalIP}:${config.port}/api/players/avatar/${player._id}`;
    }
    try {
        if (config.steamApiKey.length === 0) {
            return res.json(response);
        }
        const re = await (0, node_fetch_1.default)(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steamApiKey}&steamids=${req.params.steamid}`, {}).then(res => res.json());
        if (re.response && re.response.players && re.response.players[0] && re.response.players[0].avatarfull) {
            response.steam = re.response.players[0].avatarfull;
        }
    }
    catch { }
    return res.json(response);
};
exports.getAvatarURLBySteamID = getAvatarURLBySteamID;
const getFields = async (req, res) => {
    const fields = await F.getFields('players', __1.customer.game);
    return res.json(fields);
};
exports.getFields = getFields;
const updateFields = async (req, res) => {
    if (!req.body) {
        return res.sendStatus(422);
    }
    const newFields = await F.updateFields(req.body, 'players', __1.customer.game);
    return res.json(newFields);
};
exports.updateFields = updateFields;
