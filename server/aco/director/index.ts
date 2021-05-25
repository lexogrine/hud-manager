import { CSGO, CSGOGSI } from 'csgogsi';
import { MIRVPGL } from '../../hlae';
import { getActiveAreas, getBestArea, MapAreaConfigWithPlayers } from '../observer';

const CONFIG_INTERVAL = 4000;
const AREA_INTERVAL = 1500;

class Director {
	GSI: CSGOGSI;
	pgl: MIRVPGL | null;

	status: boolean;
	private currentArea: string | null;
	private currentConfig: string | null;
	private lastSwitch: number;

	constructor(GSI?: CSGOGSI) {
		this.GSI = GSI || new CSGOGSI();
		this.status = false;
		this.currentArea = null;
		this.currentConfig = null;
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
		const rawMapName = data.map.name;

		const mapName = rawMapName.substr(rawMapName.lastIndexOf('/') + 1);

		const activeAreas = getActiveAreas(mapName, data.players);
		const area = getBestArea(mapName, data.players);

		const isCurrentAreaEmpty = Boolean(
			this.currentArea && !activeAreas.find(area => area.name === this.currentArea)
		);

		if (!area) {
			if (isCurrentAreaEmpty) {
				// Handle empty area
			}
			return;
		}
		this.switchToArea(area);
	};

	private switchToArea = (area: MapAreaConfigWithPlayers) => {
		const isAreaTheSame = this.currentArea === area.name;
		const isAreaShowingForMorethanInterval = new Date().getTime() - this.lastSwitch > AREA_INTERVAL;
		if (!isAreaShowingForMorethanInterval) return;

		if(isAreaTheSame && new Date().getTime() - this.lastSwitch <= CONFIG_INTERVAL){
			return;
		}

		let configIndex = 0;

		if(area.configs.length > 1){
			const notUsedConfigs = area.configs.filter(config => config !== this.currentConfig);

			configIndex = Math.floor(Math.random() * notUsedConfigs.length);
		}

		const config = area.configs[configIndex];

		if (!config) return;

		this.switchHLAE(config, area);
	};

	private switchHLAE = (config: string, area: MapAreaConfigWithPlayers) => {
		if (!this.status) return;

		this.lastSwitch = new Date().getTime();
		this.currentArea = area.name;

		//const tableData = area.players.map(player => ({ name: player.name, position: player.position }));
		if (this.pgl) {
			this.pgl.execute(config);
		}
	};
}

export { Director };
