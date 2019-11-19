import express from 'express';
import sockets from './sockets';
import http from 'http';
import cors from 'cors';
import router from './api';
import path from 'path';
//import fs from 'fs';
import { loadConfig } from './api/config';

const child_process = require("child_process");

export default async function init(port?: number){
    
    const config = await loadConfig();
    const app = express();
    const server = http.createServer(app);
    const _boltobserv = child_process.fork(path.join(__dirname, '../boltobserv/index.js'));


    app.use(express.urlencoded({extended:true}));
    app.use(express.raw({limit: '10Mb', type: 'application/json'}));
    app.use((req, res, next) => {
        try{
            if(req.body){
                const text = req.body.toString().replace(/"(player|owner)":([ ]*)([0-9]+)/gm, '"$1": "$3"').replace(/(player|owner):([ ]*)([0-9]+)/gm, '"$1": "$3"');
                req.body = JSON.parse(text);
            }
            next();
        } catch(e) {
            next();
        }
    });
    app.use(cors({origin:"*", credentials: true}));

    const io = sockets(server, app);

    router(app, io);

    app.use('/',  express.static(path.join(__dirname, '../build')));
    app.get('*', (_req, res)=>{
        res.sendFile(path.join(__dirname, '../build/index.html'));
    });
    return server.listen(config.port || 1337);
}