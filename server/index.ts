import express from 'express';
import socketio from 'socket.io';
import http from 'http';
import cors from 'cors';
import router from './api';
import { loadConfig } from './api/config';

export default async function init(port?: number){
    
    const config = await loadConfig();
    const app = express();
    const server = http.createServer(app);

    const io = socketio(server);

    app.use(express.urlencoded({extended:true}));
    app.use(express.json({limit:'10Mb'}));
    app.use(cors({origin:"*", credentials: true}));

    router(app);

    return server.listen(config.port || 1337);
}