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
exports.updateFields = exports.getFields = exports.getLogoFile = exports.deleteTeam = exports.updateTeam = exports.addTeamsWithExcel = exports.addTeam = exports.getTeam = exports.getTeams = void 0;
const database_1 = require("./../../../init/database");
const interfaces_1 = require("../../../types/interfaces");
const config_1 = require("./../config");
const isSvg_1 = __importDefault(require("./../../../src/isSvg"));
const index_1 = require("./index");
const F = __importStar(require("./../fields"));
const __1 = require("..");
const cloud_1 = require("../cloud");
const exceljs_1 = require("exceljs");
const getTeams = async (req, res) => {
    const game = __1.customer.game;
    const $or = [{ game }];
    if (game === 'csgo') {
        $or.push({ game: { $exists: false } });
    }
    const teams = await (0, index_1.getTeamsList)({ $or });
    const config = await (0, config_1.loadConfig)();
    return res.json(teams.map(team => ({
        ...team,
        logo: team.logo && team.logo.length ? `http://${config_1.internalIP}:${config.port}/api/teams/logo/${team._id}` : null
    })));
};
exports.getTeams = getTeams;
const getTeam = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const team = await (0, index_1.getTeamById)(req.params.id, true);
    if (!team) {
        return res.sendStatus(404);
    }
    const config = await (0, config_1.loadConfig)();
    return res.json({
        ...team,
        logo: team.logo && team.logo.length ? `http://${config_1.internalIP}:${config.port}/api/teams/logo/${team._id}` : null
    });
};
exports.getTeam = getTeam;
const addTeam = async (req, res) => {
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)()) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    const newTeam = {
        name: req.body.name,
        shortName: req.body.shortName,
        logo: req.body.logo,
        country: req.body.country,
        game: __1.customer.game,
        extra: req.body.extra
    };
    const result = await (0, index_1.addTeams)([newTeam]);
    if (!result || !result.length) {
        return res.sendStatus(500);
    }
    if (cloudStatus) {
        await (0, cloud_1.addResource)(__1.customer.game, 'teams', result[0]);
    }
    else {
        (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['teams']);
    }
    return res.json(result[0]);
};
exports.addTeam = addTeam;
const addTeamsWithExcel = async (req, res) => {
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
        const teams = [];
        worksheet.eachRow(row => {
            const name = row.getCell('A').value?.toString?.();
            if (!name || name === 'Team name') {
                return;
            }
            const shortName = row.getCell('B').value?.toString?.();
            const country = row.getCell('C').value?.toString?.();
            teams.push({
                name,
                shortName,
                country,
                logo: '',
                game,
                extra: {}
            });
        });
        const result = await (0, index_1.addTeams)(teams);
        if (!result) {
            return res.sendStatus(503);
        }
        if (cloudStatus) {
            await (0, cloud_1.addResource)(__1.customer.game, 'teams', result);
        }
        else {
            (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['teams']);
        }
        return res.json({ message: `Added ${result.length} teams` });
    }
    catch {
        return res.sendStatus(500);
    }
};
exports.addTeamsWithExcel = addTeamsWithExcel;
const updateTeam = async (req, res) => {
    if (!database_1.databaseContext.databases.teams) {
        return res.sendStatus(500);
    }
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const team = await (0, index_1.getTeamById)(req.params.id, true);
    if (!team) {
        return res.sendStatus(404);
    }
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)()) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    const updated = {
        name: req.body.name,
        shortName: req.body.shortName,
        logo: req.body.logo,
        game: __1.customer.game,
        country: req.body.country,
        extra: req.body.extra
    };
    if (req.body.logo === undefined) {
        updated.logo = team.logo;
    }
    database_1.databaseContext.databases.teams.update({ _id: req.params.id }, { $set: updated }, {}, async (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (cloudStatus) {
            await (0, cloud_1.updateResource)(__1.customer.game, 'teams', { ...updated, _id: req.params.id });
        }
        else {
            (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['teams']);
        }
        const team = await (0, index_1.getTeamById)(req.params.id);
        return res.json(team);
    });
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res) => {
    if (!database_1.databaseContext.databases.teams) {
        return res.sendStatus(500);
    }
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    /*
    const team = await getTeamById(req.params.id);
    if (!team) {
        return res.sendStatus(404);
    }
    */
    const ids = req.params.id.split(';');
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)()) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    //players.update({team:})
    database_1.databaseContext.databases.teams.remove({ _id: { $in: ids } }, { multi: true }, async (err, n) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (cloudStatus) {
            await (0, cloud_1.deleteResource)(__1.customer.game, 'teams', ids);
        }
        else {
            (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['teams']);
        }
        return res.sendStatus(n ? 200 : 404);
    });
};
exports.deleteTeam = deleteTeam;
const getLogoFile = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const team = await (0, index_1.getTeamById)(req.params.id, true);
    if (!team || !team.logo || !team.logo.length) {
        return res.sendStatus(404);
    }
    const imgBuffer = Buffer.from(team.logo, 'base64');
    res.writeHead(200, {
        'Content-Type': (0, isSvg_1.default)(imgBuffer) ? 'image/svg+xml' : 'image/png',
        'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
};
exports.getLogoFile = getLogoFile;
const getFields = async (req, res) => {
    const fields = await F.getFields('teams', __1.customer.game);
    return res.json(fields);
};
exports.getFields = getFields;
const updateFields = async (req, res) => {
    if (!req.body) {
        return res.sendStatus(422);
    }
    const newFields = await F.updateFields(req.body, 'teams', __1.customer.game);
    return res.json(newFields);
};
exports.updateFields = updateFields;
