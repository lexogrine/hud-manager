import express from 'express';
import sockets from './sockets';
import http from 'http';
import cors from 'cors';
import router from './api';
import { loadConfig } from './api/config';

export default async function init(port?: number){
    
    const config = await loadConfig();
    const app = express();
    const server = http.createServer(app);


    app.use(express.urlencoded({extended:true}));
    app.use(express.json({limit:'10Mb'}));
    app.use(cors({origin:"*", credentials: true}));

    const io = sockets(server, app);

    router(app);
    return server.listen(config.port || 1337);
}