import socketio from 'socket.io';
import http from 'http';
import express from 'express';
import CSGOGSI from 'csgogsi';
import { getMatchV2, updateMatch } from './api/match'

export const GSI = new CSGOGSI();

export default function (server: http.Server, app: express.Router) {
    let last = null;
    const io = socketio(server);

    app.post('/', (req, res) => {
        res.sendStatus(200);
        last = req.body;
        io.emit('update', req.body);
        GSI.digest(req.body);
    });

    io.on('connection', socket => {
        socket.on('ready', () => {
            if (last) {
                socket.emit("update", last);
            }
        });

    });


    GSI.on("matchEnd", score => {
        const match = getMatchV2();
        const {vetos} = match;
        vetos.map(veto => {
            if (veto.mapName !== score.map.name) {
                return veto;
            }
            veto.score = score;
            return veto;
        });
        match.vetos = vetos;
        updateMatch(match)
        io.emit('match', true);
    });

    return io;
}