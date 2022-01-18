"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestArea = exports.getActiveAreasSorted = void 0;
const polygon_1 = require("../polygon");
const areas_1 = __importDefault(require("../areas"));
const queue_1 = require("../queue");
const sortAreas = (a, b) => {
    if (a.players.length === b.players.length) {
        return b.priority - a.priority;
    }
    return b.players.length - a.players.length;
};
const getRandomElement = (array) => {
    if (!array || !array.length)
        return null;
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};
const getActiveAreasSorted = (mapName, players, bomb) => {
    const config = areas_1.default.areas.find(cfg => cfg.map === mapName);
    if (!config) {
        return [];
    }
    const alivePlayers = players.filter(player => player.state.health > 0);
    if (!alivePlayers.length) {
        return [];
    }
    if (bomb && bomb.position && (bomb?.state === 'planting' || bomb?.state === 'defusing')) {
        const areasWithBomb = config.areas
            .map(area => {
            const cornersWithFirstAtEnd = [...area.polygonCorners, area.polygonCorners[0]];
            const playersInside = alivePlayers.filter(player => (0, polygon_1.isInPolygon)(player.position, [cornersWithFirstAtEnd]));
            return {
                ...area,
                players: playersInside
            };
        })
            .filter(area => {
            const cornersWithFirstAtEnd = [...area.polygonCorners, area.polygonCorners[0]];
            const isBombInside = (0, polygon_1.isInPolygon)(bomb.position.split(', ').map(n => Number(n)), [cornersWithFirstAtEnd]);
            return !!isBombInside;
        })
            .sort(sortAreas);
        return areasWithBomb;
    }
    const areasWithPlayers = config.areas
        .map(area => {
        const cornersWithFirstAtEnd = [...area.polygonCorners, area.polygonCorners[0]];
        const playersInside = alivePlayers.filter(player => (0, polygon_1.isInPolygon)(player.position, [cornersWithFirstAtEnd]));
        return {
            ...area,
            players: playersInside
        };
    })
        .filter(area => area.players.length > 0)
        .sort(sortAreas);
    return areasWithPlayers;
};
exports.getActiveAreasSorted = getActiveAreasSorted;
const getBestArea = (mapName, players, bomb) => {
    const activeAreas = (0, exports.getActiveAreasSorted)(mapName, players, bomb);
    const activeAreasConfigs = [];
    for (const activeArea of activeAreas) {
        for (const config of activeArea.configs) {
            activeAreasConfigs.push({
                areaName: activeArea.name,
                config,
                strength: activeArea.priority + activeArea.players.length
            });
        }
    }
    if (!activeAreasConfigs.length)
        return null;
    const unique = activeAreasConfigs.filter(config => (0, queue_1.isConfigAvailableForUsage)(config.areaName, config.config));
    if (!unique.length) {
        const maxStrength = Math.max(...activeAreasConfigs.map(config => config.strength));
        return getRandomElement(activeAreasConfigs.filter(config => config.strength === maxStrength));
    }
    const maxStrength = Math.max(...unique.map(config => config.strength));
    return getRandomElement(unique);
};
exports.getBestArea = getBestArea;
