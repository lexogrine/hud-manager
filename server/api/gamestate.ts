import fs from 'fs';
import path from 'path';
import * as VDF from '@node-steam/vdf';
import { getGamePath } from 'steam-game-path';
import express from 'express';
import { loadConfig } from './config';

const GSITemplate = {
    'HUDMANAGERGSI':
    {
        uri: 'http://localhost:1337/',
        timeout: 0.1,
        buffer: 0,
        throttle: 0,
        heartbeat: 0.01,
        data:
        {
            provider: 1,
            map: 1,
            round: 1,
            player_id: 1,
            allplayers_id: 1,
            player_state: 1,
            allplayers_state: 1,
            allplayers_match_stats: 1,
            allplayers_weapons: 1,
            allplayers_position: 1,
            phase_countdowns: 1,
            allgrenades: 1,
            map_round_wins: 1,
            player_position: 1,
            bomb: 1
        }
    }
}

export const checkGSIFile: express.RequestHandler = async (req, res) => {
    const config = await loadConfig();
    const CSGOPath = getGamePath(730);
    if (!config || !CSGOPath || !CSGOPath.game || !CSGOPath.game.path) {
        return res.json({});
    }
    const cfgPath = path.join(CSGOPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
    if (!fs.existsSync(cfgPath)) {
        return res.json({success: false, message: 'File couldn\'t be found'});
    }
    try {
        const rawContent = fs.readFileSync(cfgPath, 'UTF-8');
        const content = VDF.parse(rawContent);
        if(!content || !content.HUDMANAGERGSI){
            //Corrupted file
            return res.json({success: false, message: 'File seems to be corrupted'});
        }
        if(!content.HUDMANAGERGSI.uri.endsWith(`:${config.port}/`)){
            // wrong port
            return res.json({success: false, message: 'Wrong address'});
        }
        if(JSON.stringify(GSITemplate.HUDMANAGERGSI.data) != JSON.stringify(content.HUDMANAGERGSI.data)){
            // wrong settings
            return res.json({success: false, message: 'Wrong configuration'});
        }
        return res.json({success: true});
    } catch {
        return res.json({success: false, message: 'Unexpected error occured'})
    }
}

export const createGSIFile: express.RequestHandler = async (req, res) => {
    const config = await loadConfig();
    if(!config){
        return res.sendStatus(422);
    }
    
    const CSGOPath = getGamePath(730);
    if (!CSGOPath || !CSGOPath.game || !CSGOPath.game.path) {
        return res.json({});
    }

    const address = `http://localhost:${config.port}/`;
    const gsiCFG = {...GSITemplate};
    gsiCFG.HUDMANAGERGSI.uri = address;

    const text = VDF.stringify(gsiCFG);
    const cfgPath = path.join(CSGOPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
    try {
        if(fs.existsSync(cfgPath)){
            fs.unlinkSync(cfgPath);
        }
        fs.writeFileSync(cfgPath, text, 'UTF-8');
        return res.json({success: true, message: 'Config file was successfully saved'})
    } catch {
        return res.json({success: false, message: 'Unexpected error occured'})
    }

    
}