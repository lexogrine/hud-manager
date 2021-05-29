import { Player } from 'csgogsi';
import { isInPolygon } from '../polygon';
import { MapAreaConfig } from '../../../types/interfaces';
import areas from '../areas';
import { isConfigAvailableForUsage } from '../queue';

export interface MapAreaConfigWithPlayers extends MapAreaConfig {
	players: Player[];
}

export interface ExecutableACOConfig {
	config: string;
	areaName: string;
	strength: number;
}

const sortAreas = (a: MapAreaConfigWithPlayers, b: MapAreaConfigWithPlayers) => {
	if(a.players.length === b.players.length){
		return b.priority - a.priority;
	}
	return b.players.length - a.players.length;
}

const getRandomElement = (array: any[]) => {
	if(!array || !array.length) return null
	
	const index = Math.floor(Math.random() * array.length);
	return array[index];
}

export const getActiveAreasSorted = (mapName: string, players: Player[]) => {
	const config = areas.areas.find(cfg => cfg.map === mapName);
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
			const playersInside = alivePlayers.filter(player => isInPolygon(player.position, [cornersWithFirstAtEnd]));
			return {
				...area,
				players: playersInside
			} as MapAreaConfigWithPlayers;
		})
		.filter(area => area.players.length > 0)
		.sort(sortAreas);
	return areasWithPlayers;
};

export const getBestArea = (mapName: string, players: Player[]) => {
	const activeAreas = getActiveAreasSorted(mapName, players);

	const activeAreasConfigs: ExecutableACOConfig[] = [];

	for(const activeArea of activeAreas){
		for(const config of activeArea.configs){
			activeAreasConfigs.push({ areaName: activeArea.name, config, strength: activeArea.priority + activeArea.players.length });
		}
	}

	if (!activeAreasConfigs.length) return null;

	const unique = activeAreasConfigs.filter(config => isConfigAvailableForUsage(config.areaName, config.config));

	if(!unique.length) {
		const maxStrength = Math.max(...activeAreasConfigs.map(config => config.strength));
		return getRandomElement(activeAreasConfigs.filter(config => config.strength === maxStrength));
	}

	const maxStrength = Math.max(...unique.map(config => config.strength));

	return getRandomElement(unique);
};
