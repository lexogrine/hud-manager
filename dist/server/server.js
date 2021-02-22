"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const BufferReader_1 = __importDefault(require("./hlae/BufferReader"));
const GameEventUnserializer_1 = __importDefault(require("./hlae/GameEventUnserializer"));
const init = (callback) => {
    const server = http_1.default.createServer();
    const webSocketServer = new ws_1.Server({ server, path: '/mirv' });
    const enrichments = {
        player_death: ['userid', 'attacker', 'assister']
    };
    let socket;
    webSocketServer.on('connection', newSocket => {
        if (socket) {
            socket.close();
            socket = newSocket;
        }
        socket = newSocket;
        const gameEventUnserializer = new GameEventUnserializer_1.default(enrichments);
        socket.on('message', data => {
            if (!(data instanceof Buffer)) {
                return;
            }
            const bufferReader = new BufferReader_1.default(Buffer.from(data));
            try {
                while (!bufferReader.eof()) {
                    const cmd = bufferReader.readCString();
                    if (cmd !== 'hello' && cmd !== 'gameEvent') {
                        return;
                    }
                    if (cmd === 'hello') {
                        const version = bufferReader.readUInt32LE();
                        if (2 != version)
                            throw 'Error: version mismatch';
                        socket.send(new Uint8Array(Buffer.from('transBegin\0', 'utf8')), { binary: true });
                        socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich clientTime 1\0', 'utf8')), { binary: true });
                        socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "userid"\0', 'utf8')), { binary: true });
                        socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "attacker"\0', 'utf8')), { binary: true });
                        socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "assister"\0', 'utf8')), { binary: true });
                        socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enabled 1\0', 'utf8')), {
                            binary: true
                        });
                        socket.send(new Uint8Array(Buffer.from('transEnd\0', 'utf8')), { binary: true });
                        return;
                    }
                    const gameEvent = gameEventUnserializer.unserialize(bufferReader);
                    if (gameEvent.name === 'player_death') {
                        if (callback) {
                            callback(gameEvent);
                        }
                        //console.log(JSON.stringify(gameEvent));
                    }
                }
            }
            catch (err) { }
        });
    });
    server.listen(31337);
};
exports.default = init;
