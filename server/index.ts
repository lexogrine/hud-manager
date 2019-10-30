import express from 'express';
import sockets from './sockets';
import http from 'http';
import cors from 'cors';
import router from './api';
import path from 'path';
import { loadConfig } from './api/config';

export default async function init(port?: number){
    
    const config = await loadConfig();
    const app = express();
    const server = http.createServer(app);


    app.use(express.urlencoded({extended:true}));
    //app.use(express.json({limit:'10Mb'}));
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

    router(app);

    app.use('/',  express.static(path.join(__dirname, '../build')));
    app.get('*', (_req: any, res: any)=>{
        res.sendFile(path.join(__dirname, '../build/index.html'));
    });
    return server.listen(config.port || 1337);
}