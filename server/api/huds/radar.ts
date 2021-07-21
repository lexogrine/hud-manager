import { RequestHandler } from 'express';
import { maps } from './radar/maps';
import { internalIP, loadConfig } from '../config';


export const getRadarConfigs: RequestHandler = async (req, res) => {
    const config = await loadConfig();
    const mapNames = Object.keys(maps);
    for(const mapName of mapNames){
        const mapConfig = maps[mapName];
        if(!mapConfig) continue;

        mapConfig.file = `http://${internalIP}:${config.port}/maps/${mapName}/radar.png`;
    }


    return res.json(maps);
}