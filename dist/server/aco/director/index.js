"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Director = void 0;
const csgogsi_1 = require("csgogsi");
const observer_1 = require("../observer");
const CONFIG_INTERVAL = 4000;
const AREA_INTERVAL = 1500;
class Director {
    constructor(GSI) {
        this.start = () => {
            this.status = true;
        };
        this.stop = () => {
            this.status = false;
        };
        this.handleObserver = (data) => {
            const rawMapName = data.map.name;
            const mapName = rawMapName.substr(rawMapName.lastIndexOf('/') + 1);
            const activeAreas = observer_1.getActiveAreas(mapName, data.players);
            const area = observer_1.getBestArea(mapName, data.players);
            const isCurrentAreaEmpty = Boolean(this.currentArea && !activeAreas.find(area => area.name === this.currentArea));
            if (!area) {
                if (isCurrentAreaEmpty) {
                    // Handle empty area
                }
                return;
            }
            this.switchToArea(area);
        };
        this.switchToArea = (area) => {
            const isAreaTheSame = this.currentArea === area.name;
            const isAreaShowingForMorethanInterval = new Date().getTime() - this.lastSwitch > AREA_INTERVAL;
            if (!isAreaShowingForMorethanInterval)
                return;
            if (isAreaTheSame && new Date().getTime() - this.lastSwitch <= CONFIG_INTERVAL) {
                return;
            }
            let configIndex = 0;
            if (area.configs.length > 1) {
                const notUsedConfigs = area.configs.filter(config => config !== this.currentConfig);
                configIndex = Math.floor(Math.random() * notUsedConfigs.length);
            }
            const config = area.configs[configIndex];
            if (!config)
                return;
            this.switchHLAE(config, area);
        };
        this.switchHLAE = (config, area) => {
            if (!this.status)
                return;
            this.lastSwitch = new Date().getTime();
            this.currentArea = area.name;
            //const tableData = area.players.map(player => ({ name: player.name, position: player.position }));
            if (this.pgl) {
                this.pgl.execute(config);
            }
        };
        this.GSI = GSI || new csgogsi_1.CSGOGSI();
        this.status = false;
        this.currentArea = null;
        this.currentConfig = null;
        this.lastSwitch = 0;
        this.GSI.on('data', this.handleObserver);
        this.pgl = null;
    }
}
exports.Director = Director;
