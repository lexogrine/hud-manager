"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Director = void 0;
const csgogsi_1 = require("csgogsi");
const observer_1 = require("../observer");
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
            const isAreaShowingForMorethanInterval = new Date().getTime() - this.lastSwitch > 4000;
            if (isAreaTheSame || !isAreaShowingForMorethanInterval)
                return;
            const randomIndex = Math.floor(Math.random() * area.configs.length);
            const config = area.configs[randomIndex];
            if (!config)
                return;
            this.switchHLAE(config, area);
        };
        this.switchHLAE = (config, area) => {
            if (!this.status)
                return;
            this.lastSwitch = new Date().getTime();
            this.currentArea = area.name;
            const tableData = area.players.map(player => ({ name: player.name, position: player.position }));
            console.log('Players in area');
            console.table(tableData);
            if (this.pgl) {
                console.log('executing...', config);
                this.pgl.execute(config);
            }
        };
        this.GSI = GSI || new csgogsi_1.CSGOGSI();
        this.status = false;
        this.currentArea = null;
        this.lastSwitch = 0;
        console.log(GSI);
        this.GSI.on('data', this.handleObserver);
        this.pgl = null;
    }
}
exports.Director = Director;
