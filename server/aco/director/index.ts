import { CSGO, CSGOGSI } from 'csgogsi';
import { MIRVPGL } from '../../hlae';
import { getActiveAreasSorted, getBestArea, MapAreaConfigWithPlayers, ExecutableACOConfig } from '../observer';
import { addToQueue, clearQueue } from '../queue';

const CONFIG_INTERVAL = 4000;
const AREA_INTERVAL = 3000;

class Director {
	GSI: CSGOGSI;
	pgl: MIRVPGL | null;

	status: boolean;
	private currentArea: string | null;
	private lastSwitch: number;

	constructor(GSI?: CSGOGSI) {
		this.GSI = GSI || new CSGOGSI();
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

	private handleObserver = (data: CSGO) => {
		if (!this.status) return;
		const rawMapName = data.map.name;

		const mapName = rawMapName.substr(rawMapName.lastIndexOf('/') + 1);

		const activeAreas = getActiveAreasSorted(mapName, data.players);
		const area = getBestArea(mapName, data.players);

		const isCurrentAreaEmpty = Boolean(
			this.currentArea && !activeAreas.find(area => area.name === this.currentArea)
		);
		if (isCurrentAreaEmpty) {
			this.lastSwitch = new Date().getTime() - AREA_INTERVAL + 750;
			this.currentArea = null;
			clearQueue();
		}

		if (!area) {
			return;
		}
		this.switchToArea(area);
	};

	private switchToArea = (config: ExecutableACOConfig) => {
		const isAreaTheSame = this.currentArea === config.areaName;
		const isAreaShowingForMorethanInterval = new Date().getTime() - this.lastSwitch > AREA_INTERVAL;
		if (!isAreaShowingForMorethanInterval) return;

		if (isAreaTheSame && new Date().getTime() - this.lastSwitch <= CONFIG_INTERVAL) {
			return;
		}

		this.switchHLAE(config.config, config.areaName);
	};

	private switchHLAE = (config: string, areaName: string) => {

		this.lastSwitch = new Date().getTime();
		this.currentArea = areaName;

		addToQueue(areaName, config);

		//const tableData = area.players.map(player => ({ name: player.name, position: player.position }));
		if (this.pgl) {
			this.pgl.execute(config);
		}
	};
}

export { Director };
