"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRadarConfigs = void 0;
const maps_1 = require("./radar/maps");
const config_1 = require("../config");
const getRadarConfigs = async (req, res) => {
    const config = await config_1.loadConfig();
    const mapNames = Object.keys(maps_1.maps);
    for (const mapName of mapNames) {
        const mapConfig = maps_1.maps[mapName];
        if (!mapConfig)
            continue;
        mapConfig.file = `http://${config_1.internalIP}:${config.port}/maps/${mapName}/radar.png`;
    }
    return res.json(maps_1.maps);
};
exports.getRadarConfigs = getRadarConfigs;
