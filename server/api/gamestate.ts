import fs from 'fs';
import path from 'path';
import * as VDF from '@node-steam/vdf';
import { getGamePath } from 'steam-game-path';
import express from 'express';
import { loadConfig } from './config';
import { dialog } from 'electron';

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
        return res.json({success: false, message: "CSGO path couldn't be found", accessible: false});
    }
    const cfgPath = path.join(CSGOPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
    if (!fs.existsSync(cfgPath)) {
        return res.json({success: false, message: 'File couldn\'t be found', accessible: true});
    }
    try {
        const rawContent = fs.readFileSync(cfgPath, 'UTF-8');
        const content = VDF.parse(rawContent);
        if(!content || !content.HUDMANAGERGSI){
            //Corrupted file
            return res.json({success: false, message: 'File seems to be corrupted', accessible: true});
        }
        if(!content.HUDMANAGERGSI.uri.endsWith(`:${config.port}/`)){
            // wrong port
            return res.json({success: false, message: 'Wrong address', accessible: true});
        }
        if(JSON.stringify(GSITemplate.HUDMANAGERGSI.data) != JSON.stringify(content.HUDMANAGERGSI.data)){
            // wrong settings
            return res.json({success: false, message: 'Wrong configuration', accessible: true});
        }
        return res.json({success: true});
    } catch {
        return res.json({success: false, message: 'Unexpected error occured', accessible: true})
    }
}

export const generateGSIFile = async () => {
    const config = await loadConfig();
    if(!config){
        return null;
    }
    const address = `http://localhost:${config.port}/`;
    const gsiCFG = {...GSITemplate};
    gsiCFG.HUDMANAGERGSI.uri = address;

    const text = VDF.stringify(gsiCFG);
    return text;
}

export const createGSIFile: express.RequestHandler = async (req, res) => {
    const text = await generateGSIFile();
    if(!text){
        return res.sendStatus(422);
    }
    
    const CSGOPath = getGamePath(730);
    if (!CSGOPath || !CSGOPath.game || !CSGOPath.game.path) {
        return res.json({});
    }

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

export const saveFile = (name: string, content: string | Promise<string>, base64 = false): express.RequestHandler => async (_req, res) => {
    res.sendStatus(200);
    const result = await dialog.showSaveDialog({defaultPath: name});
    const text = typeof content === "string" ? content : await content;
    if(result.filePath){
        fs.writeFileSync(result.filePath, text, { encoding: base64 ? 'base64':'UTF-8'});
    }
}

export const cfgsZIPBase64 = 'UEsDBBQAAAAIAJOYXE84wXDJWAAAAHQAAAAWAAAAaHVkX3JhZGFyX2tpbGxmZWVkLmNmZ1XKQQqAIBAAwHuvEO8h4iHoM4uoZbC5sa5Jv48giM4zASGy70AFL4jJSy4kW0hV2eG13CIsxCH9fbTDvvEJx4qqMSrd62wMUvCYqcrsrHOTeYr+YhXPcgNQSwMEFAAAAAgAk5hcTyCrGb0xAAAANAAAAAcAAABodWQuY2ZnS86JTylKLI/Pz8upjE9JTSzJyMsvyUxOLVYw5ILKZZSmxKflFyWnxhclpiQWKRgCAFBLAwQUAAAACACTmFxPoMM5S18AAACNAAAAEAAAAGh1ZF9raWxsZmVlZC5jZmdtyzEKgDAMQNHdUxR3KaWD0MuE0FYrRCNpVLy9CIIIzv/9SJAED+CFTkgZtSysU8zVuOZpZUswsMQMggnlL3zGzjXzJDusI5lNyLRHDdYSR6TCVYN33vf2Ju0Lq6LoBVBLAwQUAAAACACTmFxPJlBm3h0AAAAbAAAADQAAAGh1ZF9yYWRhci5jZmdLzolPKUosj8/Py6mMT0lNLMnIyy/JTE4tVjAEAFBLAQIfABQAAAAIAJOYXE84wXDJWAAAAHQAAAAWACQAAAAAAAAAIAAAAAAAAABodWRfcmFkYXJfa2lsbGZlZWQuY2ZnCgAgAAAAAAABABgA9RNKKrqN1QFdZynbBcfVAUpAKdsFx9UBUEsBAh8AFAAAAAgAk5hcTyCrGb0xAAAANAAAAAcAJAAAAAAAAAAgAAAAjAAAAGh1ZC5jZmcKACAAAAAAAAEAGACvXUwquo3VAYS1KdsFx9UBhLUp2wXH1QFQSwECHwAUAAAACACTmFxPoMM5S18AAACNAAAAEAAkAAAAAAAAACAAAADiAAAAaHVkX2tpbGxmZWVkLmNmZwoAIAAAAAAAAQAYAFpzSyq6jdUBfisq2wXH1QGtAyrbBcfVAVBLAQIfABQAAAAIAJOYXE8mUGbeHQAAABsAAAANACQAAAAAAAAAIAAAAG8BAABodWRfcmFkYXIuY2ZnCgAgAAAAAAABABgALddKKrqN1QHxnyrbBcfVAeR4KtsFx9UBUEsFBgAAAAAEAAQAggEAALcBAAAAAA==';