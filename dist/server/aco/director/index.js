"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Director = void 0;
const csgogsi_1 = require("csgogsi");
const observer_1 = require("../observer");
const queue_1 = require("../queue");
const CONFIG_INTERVAL = 4000;
const AREA_INTERVAL = 3000;
class Director {
    GSI;
    pgl;
    status;
    currentArea;
    lastSwitch;
    constructor(GSI) {
        this.GSI = GSI || new csgogsi_1.CSGOGSI();
        this.status = false;
        this.currentArea = null;
        this.lastSwitch = 0;
        this.GSI.on('data', this.handleObserver);
        this.pgl = null;
    }
    start = () => {
        this.status = true;
    };
    stop = () => {
        this.status = false;
    };
    handleObserver = (data) => {
        if (!this.status)
            return;
        const rawMapName = data.map.name;
        const mapName = rawMapName.substr(rawMapName.lastIndexOf('/') + 1);
        const activeAreas = (0, observer_1.getActiveAreasSorted)(mapName, data.players);
        const area = (0, observer_1.getBestArea)(mapName, data.players);
        const isCurrentAreaEmpty = Boolean(this.currentArea && !activeAreas.find(area => area.name === this.currentArea));
        if (isCurrentAreaEmpty) {
            this.lastSwitch = new Date().getTime() - AREA_INTERVAL + 750;
            this.currentArea = null;
            (0, queue_1.clearQueue)();
        }
        if (!area) {
            return;
        }
        this.switchToArea(area);
    };
    switchToArea = (config) => {
        const isAreaTheSame = this.currentArea === config.areaName;
        const isAreaShowingForMorethanInterval = new Date().getTime() - this.lastSwitch > AREA_INTERVAL;
        if (!isAreaShowingForMorethanInterval)
            return;
        if (isAreaTheSame && new Date().getTime() - this.lastSwitch <= CONFIG_INTERVAL) {
            return;
        }
        this.switchHLAE(config.config, config.areaName);
    };
    switchHLAE = (config, areaName) => {
        this.lastSwitch = new Date().getTime();
        this.currentArea = areaName;
        (0, queue_1.addToQueue)(areaName, config);
        //const tableData = area.players.map(player => ({ name: player.name, position: player.position }));
        if (this.pgl) {
            this.pgl.execute(config);
        }
    };
}
exports.Director = Director;
