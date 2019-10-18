import socketio from 'socket.io';
import http from 'http';
import express from 'express';

export default function(server: http.Server, app: express.Router) {
    let last = null;
    const io = socketio(server);

    app.post('/', (req, res) => {
        res.sendStatus(200);
        last = req.body;
        io.emit('update', req.body);
    });

    io.on('connection', socket => {
        socket.on('ready', () => {
            if (last) {
                socket.emit("update", last);
            }
        });
    })

    return io;
}