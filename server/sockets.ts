import socketio from 'socket.io';
import http from 'http';

export default function(server: http.Server) {
    const io = socketio(server);
    return io;
}