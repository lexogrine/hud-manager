import express from 'express';
import db from './../../init/database';
import fs from 'fs';
import { Config } from '../../types/interfaces';

const configs = db.config;

export const loadConfig = async (): Promise<Config | null> => {
    return new Promise((res, rej) => {
        configs.find({}, async (err, config) => {
            if(err){
                return res(null);
            }
            if(config.length){
                if(!config[0].hlaePath || fs.existsSync(config[0].hlaePath)){
                    return res(config[0]);
                }
                config[0].hlaePath = '';
                return res(await setConfig(config[0]));

            }
            configs.insert({steamApiKey:'',token:'',port:1337, hlaePath: ''}, (err, config) => {
                if(err){
                    return res(null);
                }
                return res(config);
            });
            
        });
    })
}

export const getConfig: express.RequestHandler = async (_req, res) => {
    const config = await loadConfig();
    if(!config){
        return res.sendStatus(500);
    }
    return res.json(config);
}
export const updateConfig: express.RequestHandler = async (req, res) => {
    const updated: Config = {
        steamApiKey: req.body.steamApiKey,
        port: req.body.port,
        token: req.body.token,
        hlaePath: req.body.hlaePath
    }

    const config = await setConfig(updated);
    if(!config){
        return res.sendStatus(500);
    }
    return res.json(config);
}

export const setConfig = async (config: Config) => new Promise<Config | null>((res, rej) => {
    configs.update({}, { $set:config }, {}, async err => {
        if(err){
            return res(null);
        }
        const newConfig = await loadConfig();
        if(!newConfig){
            return res(null);
        }
        return res(newConfig);
    });
});
    
