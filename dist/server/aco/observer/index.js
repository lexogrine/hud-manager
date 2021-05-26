"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestArea = exports.getActiveAreas = void 0;
const polygon_1 = require("../polygon");
const areas_1 = __importDefault(require("../areas"));
exports.getActiveAreas = (mapName, players) => {
    const config = areas_1.default.areas.find(cfg => cfg.map === mapName);
    if (!config) {
        return [];
    }
    const alivePlayers = players.filter(player => player.state.health > 0);
    if (!alivePlayers.length) {
        return [];
    }
    const areasWithPlayers = config.areas
        .map(area => {
        const cornersWithFirstAtEnd = [...area.polygonCorners, area.polygonCorners[0]];
        const playersInside = players.filter(player => polygon_1.isInPolygon(player.position, [cornersWithFirstAtEnd]));
        return {
            ...area,
            players: playersInside
        };
    })
        .filter(area => area.players.length > 0);
    return areasWithPlayers;
};
exports.getBestArea = (mapName, players) => {
    const active = exports.getActiveAreas(mapName, players).sort((a, b) => b.players.length - a.players.length);
    if (!active.length)
        return null;
    const maxPlayersIncluded = active[0].players.length;
    const equalAreas = active.filter(area => area.players.length === maxPlayersIncluded);
    if (equalAreas.length === 1) {
        return equalAreas[0];
    }
    return equalAreas.sort((a, b) => b.priority - a.priority)[0];
};
