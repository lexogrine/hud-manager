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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFields = exports.getFields = exports.getLogoFile = exports.deleteTeam = exports.updateTeam = exports.addTeam = exports.getTeam = exports.getTeams = void 0;
const database_1 = __importDefault(require("./../../../init/database"));
const config_1 = require("./../config");
const isSvg_1 = __importDefault(require("./../../../src/isSvg"));
const index_1 = require("./index");
const F = __importStar(require("./../fields"));
const __1 = require("..");
const cloud_1 = require("../cloud");
const teams = database_1.default.teams;
const players = database_1.default.players;
exports.getTeams = async (req, res) => {
    const game = __1.customer.game;
    const $or = [{ game }];
    if (game === 'csgo') {
        $or.push({ game: { $exists: false } });
    }
    const teams = await index_1.getTeamsList({ $or });
    const config = await config_1.loadConfig();
    return res.json(teams.map(team => ({
        ...team,
        logo: team.logo && team.logo.length ? `http://${config_1.internalIP}:${config.port}/api/teams/logo/${team._id}` : null
    })));
};
exports.getTeam = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const team = await index_1.getTeamById(req.params.id, true);
    if (!team) {
        return res.sendStatus(404);
    }
    return res.json(team);
};
exports.addTeam = async (req, res) => {
    let cloudStatus = false;
    if (__1.validateCloudAbility()) {
        cloudStatus = (await cloud_1.checkCloudStatus(__1.customer.game)) === 'ALL_SYNCED';
    }
    const newTeam = {
        name: req.body.name,
        shortName: req.body.shortName,
        logo: req.body.logo,
        country: req.body.country,
        game: __1.customer.game,
        extra: req.body.extra
    };
    teams.insert(newTeam, async (err, team) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (cloudStatus) {
            await cloud_1.addResource(__1.customer.game, 'teams', team);
        }
        return res.json(team);
    });
};
exports.updateTeam = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const team = await index_1.getTeamById(req.params.id, true);
    if (!team) {
        return res.sendStatus(404);
    }
    let cloudStatus = false;
    if (__1.validateCloudAbility()) {
        cloudStatus = (await cloud_1.checkCloudStatus(__1.customer.game)) === 'ALL_SYNCED';
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
    teams.update({ _id: req.params.id }, { $set: updated }, {}, async (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (cloudStatus) {
            await cloud_1.updateResource(__1.customer.game, 'teams', { ...updated, _id: req.params.id });
        }
        const team = await index_1.getTeamById(req.params.id);
        return res.json(team);
    });
};
exports.deleteTeam = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const team = await index_1.getTeamById(req.params.id);
    if (!team) {
        return res.sendStatus(404);
    }
    let cloudStatus = false;
    if (__1.validateCloudAbility()) {
        cloudStatus = (await cloud_1.checkCloudStatus(__1.customer.game)) === 'ALL_SYNCED';
    }
    //players.update({team:})
    teams.remove({ _id: req.params.id }, async (err, n) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (cloudStatus) {
            await cloud_1.deleteResource(__1.customer.game, 'teams', req.params.id);
        }
        return res.sendStatus(n ? 200 : 404);
    });
};
exports.getLogoFile = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const team = await index_1.getTeamById(req.params.id, true);
    if (!team || !team.logo || !team.logo.length) {
        return res.sendStatus(404);
    }
    const imgBuffer = Buffer.from(team.logo, 'base64');
    res.writeHead(200, {
        'Content-Type': isSvg_1.default(imgBuffer) ? 'image/svg+xml' : 'image/png',
        'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
};
exports.getFields = async (req, res) => {
    const fields = await F.getFields('teams', __1.customer.game);
    return res.json(fields);
};
exports.updateFields = async (req, res) => {
    if (!req.body) {
        return res.sendStatus(422);
    }
    const newFields = await F.updateFields(req.body, 'teams', __1.customer.game);
    return res.json(newFields);
};
