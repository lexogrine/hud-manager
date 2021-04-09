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
exports.getMaps = exports.updateMatchRoute = exports.deleteMatchRoute = exports.getCurrentMatchRoute = exports.addMatchRoute = exports.getMatchRoute = exports.getMatchesRoute = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const M = __importStar(require("./index"));
const socket_1 = require("../../socket");
exports.getMatchesRoute = async (req, res) => {
    const matches = (await M.getMatches()).map(match => {
        if ('full' in req.query)
            return match;
        return {
            ...match,
            vetos: match.vetos.map(veto => ({ ...veto, game: undefined }))
        };
    });
    return res.json(matches);
};
exports.getMatchRoute = async (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(422);
    }
    const match = await M.getMatchById(req.params.id);
    if (!match) {
        return res.sendStatus(404);
    }
    return res.json(match);
};
exports.addMatchRoute = async (req, res) => {
    const match = await M.addMatch(req.body);
    return res.sendStatus(match ? 200 : 500);
};
exports.getCurrentMatchRoute = async (req, res) => {
    const match = await M.getCurrent();
    if (!match) {
        return res.sendStatus(404);
    }
    return res.json(match);
};
exports.deleteMatchRoute = async (req, res) => {
    const match = await M.deleteMatch(req.params.id);
    return res.sendStatus(match ? 200 : 500);
};
exports.updateMatchRoute = async (req, res) => {
    const io = await socket_1.ioPromise;
    const match = await M.updateMatch(req.body);
    io.emit('match');
    return res.sendStatus(match ? 200 : 500);
};
exports.getMaps = (req, res) => {
    const defaultMaps = ['de_mirage', 'de_dust2', 'de_inferno', 'de_nuke', 'de_train', 'de_overpass', 'de_vertigo'];
    const mapFilePath = path_1.default.join(electron_1.app.getPath('userData'), 'maps.json');
    try {
        const maps = JSON.parse(fs_1.default.readFileSync(mapFilePath, 'utf8'));
        if (Array.isArray(maps)) {
            return res.json(maps);
        }
        return res.json(defaultMaps);
    }
    catch {
        return res.json(defaultMaps);
    }
};
