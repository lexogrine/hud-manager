import express from 'express';
import socketio from 'socket.io';
import http from 'http';
import cors from 'cors';
import router from './api';

export default function init(port?: number){
    const app = express();
    const server = http.createServer(app);

    const io = socketio(server);

    app.use(express.urlencoded({extended:true}));
    app.use(express.json({limit:'10Mb'}));
    app.use(cors({origin:"*", credentials: true}));

    router(app);

    return server.listen(port || 1337);
}