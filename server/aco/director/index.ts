import { CSGO, CSGOGSI } from 'csgogsi';
import { MIRVPGL } from '../../hlae';
import { getActiveAreas, getBestArea, MapAreaConfigWithPlayers } from '../observer';

class Director {
	GSI: CSGOGSI;
	pgl: MIRVPGL | null;

	private status: boolean;
	private currentArea: string | null;
	private lastSwitch: number;

	constructor(GSI?: CSGOGSI) {
		this.GSI = GSI || new CSGOGSI();
		this.status = false;
		this.currentArea = null;
		this.lastSwitch = 0;
        console.log(GSI);
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
		const isAreaShowingForMorethanInterval = new Date().getTime() - this.lastSwitch > 4000;
		if (isAreaTheSame || !isAreaShowingForMorethanInterval) return;

		const randomIndex = Math.floor(Math.random() * area.configs.length);

		const config = area.configs[randomIndex];

		if (!config) return;

		this.switchHLAE(config, area);
	};

	private switchHLAE = (config: string, area: MapAreaConfigWithPlayers) => {
		if (!this.status) return;

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
}

export { Director };
