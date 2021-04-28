import { Player } from 'csgogsi';
import { isInPolygon } from '../polygon';
import { MapAreaConfig } from '../../../types/interfaces';
import areas from '../areas';

export interface MapAreaConfigWithPlayers extends MapAreaConfig {
    players: Player[];
}

export const getActiveAreas = (mapName: string, players: Player[]) => {
    const config = areas.areas.find(cfg => cfg.map === mapName);
    if (!config) {
        return [];
    }

    const alivePlayers = players.filter(player => player.state.health > 0);

    if (!alivePlayers.length) {
        return [];
    }

    const areasWithPlayers = config.areas.map(area => {
        const cornersWithFirstAtEnd = [...area.polygonCorners, area.polygonCorners[0]];
        const playersInside = players.filter(player => isInPolygon(player.position, [cornersWithFirstAtEnd]));
        return {
            ...area,
            players: playersInside
        } as MapAreaConfigWithPlayers;
    }).filter(area => area.players.length > 0);

    return areasWithPlayers;
}

export const getBestArea = (mapName: string, players: Player[]) => {
    const active = getActiveAreas(mapName, players).sort((a, b) => b.players.length - a.players.length);

    if(!active.length) return null;

    const maxPlayersIncluded = active[0].players.length;

    const equalAreas = active.filter(area => area.players.length === maxPlayersIncluded);

    if(equalAreas.length === 1){
        return equalAreas[0];
    }

    return equalAreas.sort((a, b) => b.priority - a.priority)[0];
}
