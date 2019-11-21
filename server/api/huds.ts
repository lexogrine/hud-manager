import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import express from 'express';
import * as I from './../../types/interfaces';
import socketio from 'socket.io';
import { loadConfig } from './config';
import ip from 'ip';

import HUDWindow from './../../init/huds';

export const listHUDs = async () => {
    const dir = path.join(app.getPath('home'), 'HUDs');
    const filtered = fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

    const huds = await Promise.all(filtered.map(async dirent => await getHUDData(dirent.name)));
    return huds.filter(hud => hud !== null);
}

export const getHUDs: express.RequestHandler = async (req, res) => {
    return res.json(await listHUDs());
}

export const getHUDData = async (dirName: string): Promise<I.HUD> => {
    const dir = path.join(app.getPath('home'), 'HUDs', dirName);
    const configFileDir = path.join(dir, 'hud.json');
    const globalConfig = await loadConfig();
    if(!fs.existsSync(configFileDir)){
        return null;
    }
    try {
        const configFile = fs.readFileSync(configFileDir, {encoding:'utf8'});
        const config = JSON.parse(configFile);
        config.dir = dirName;

        const panel = getHUDPanelSetting(dirName);
        const keybinds = getHUDKeyBinds(dirName);

        if(panel){
            config.panel = panel;
        }
        if(keybinds){
            config.keybinds = keybinds;
        }

        config.url = `http://${ip.address()}:${globalConfig.port}/huds/${dirName}/?port=${globalConfig.port}&isProd=true`


        return config;

    } catch(e){
        return null;
    }
}

export const getHUDKeyBinds = (dirName: string) => {
    const dir = path.join(app.getPath('home'), 'HUDs', dirName);
    const keybindsFileDir = path.join(dir, 'keybinds.json');
    if(!fs.existsSync(keybindsFileDir)){
        return null;
    }
    try {
        const keybindsFile = fs.readFileSync(keybindsFileDir, {encoding:'utf8'});
        const keybinds = JSON.parse(keybindsFile);
        return keybinds;

    } catch(e){
        return null;
    }
}

export const getHUDPanelSetting = (dirName: string) => { 
    const dir = path.join(app.getPath('home'), 'HUDs', dirName);
    const panelFileDir = path.join(dir, 'panel.json');
    if(!fs.existsSync(panelFileDir)){
        return null;
    }
    try {
        const panelFile = fs.readFileSync(panelFileDir, {encoding:'utf8'});
        const panel = JSON.parse(panelFile);
        panel.dir = dirName;
        return panel;

    } catch(e){
        return null;
    }
}
export const renderHUD: express.RequestHandler = async (req, res) => {
    if(!req.params.dir){
        return res.sendStatus(404);
    }
    const data = await getHUDData(req.params.dir);
    if(!data){
        return res.sendStatus(404);
    }
    if(data.legacy){
        return renderLegacy(req, res, null);
    }
    return render(req, res, null);
}

export const render: express.RequestHandler = (req, res) => {
    const dir = path.join(app.getPath('home'), 'HUDs', req.params.dir);
    return res.sendFile(path.join(dir, 'index.html'))
}

export const renderThumbnail: express.RequestHandler = (req, res) => {
    const thumbPath = path.join(app.getPath('home'), 'HUDs', req.params.dir, "thumb.png");
    if(fs.existsSync(thumbPath)){
        return res.sendFile(thumbPath);
    }
    return res.sendFile(path.join(__dirname, '../../assets/icon.png'));
    
}

export const renderAssets: express.RequestHandler = async (req, res, next) => {
    if(!req.params.dir){
        return res.sendStatus(404);
    }
    const data = await getHUDData(req.params.dir);
    if(!data){
        return res.sendStatus(404);
    }
    return express.static(path.join(app.getPath('home'), 'HUDs', req.params.dir))(req, res,next);
}










export const renderLegacy: express.RequestHandler = (req, res) => {
    const dir = path.join(app.getPath('home'), 'HUDs', req.params.dir);
    return res.render(path.join(dir, 'template.pug'), {
        ip:'localhost',
        port:1337,
        avatars: false,
        hud: path.join('/legacy', req.params.dir, 'index.js'),
        css: path.join('/legacy', req.params.dir, 'style.css'),
        delay: 0
    });
}

export const legacyJS: express.RequestHandler = (req, res) => {
    const dir = path.join(app.getPath('home'), 'HUDs', req.params.hudName, 'index.js');
    if(!fs.existsSync(dir)){
        return res.sendStatus(404);
    }
    try {
        const file = fs.readFileSync(dir, {encoding:'utf8'});
        res.setHeader('Content-Type', 'application/javascript');
        return res.end(file);

    } catch(e){
        return res.sendStatus(404);
    }

}
export const legacyCSS: express.RequestHandler = (req, res) => {
    const dir = path.join(app.getPath('home'), 'HUDs', req.params.hudName, 'style.css');
    if(!fs.existsSync(dir)){
        return res.sendStatus(404);
    }
    try {
        const file = fs.readFileSync(dir, {encoding:'utf8'});
        res.setHeader('Content-Type', 'text/css');
        return res.end(file);

    } catch(e){
        return res.sendStatus(404);
    }

}

export const showHUD = (io: socketio.Server) => async (req, res) => {
    const response = await HUDWindow.open(req.params.hudDir, io);
    if(response){
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
}

export const closeHUD: express.RequestHandler = (req, res) => {
    const response = HUDWindow.close();
    if(response){
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
}