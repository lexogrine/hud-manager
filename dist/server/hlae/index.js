"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIRVPGL = exports.hlaeEmitter = void 0;
const BufferReader_1 = __importDefault(require("./BufferReader"));
const GameEventUnserializer_1 = __importDefault(require("./GameEventUnserializer"));
const socket_1 = require("../socket");
const events_1 = __importDefault(require("events"));
exports.hlaeEmitter = new events_1.default();
const knownGameEvents = [];
class MIRVPGL {
    socket;
    constructor(ioPromise) {
        this.socket = null;
        exports.hlaeEmitter.emit('hlaeStatus', !!this.socket);
        this.init(ioPromise);
    }
    execute = (config) => {
        if (!this.socket)
            return;
        this.socket.send(new Uint8Array(Buffer.from(`exec\0${config}\0`, 'utf8')), { binary: true });
    };
    init = async (ioPromise) => {
        const io = await ioPromise;
        const enrichments = {
            player_death: ['userid', 'attacker', 'assister'],
            player_hurt: ['userid', 'attacker']
        };
        io.on('connection', incoming => {
            const newSocket = incoming?.client?.conn?.transport?.socket;
            const headers = incoming.request.headers;
            const isCSGO = !headers.referer &&
                !headers.accept &&
                !headers.origin &&
                !headers['accept-language'] &&
                !headers.pragma &&
                !headers['user-agent'];
            if (!isCSGO) {
                return;
            }
            newSocket.on('close', () => {
                this.socket = null;
                exports.hlaeEmitter.emit('hlaeStatus', !!this.socket);
            });
            if (this.socket) {
                this.socket.close();
            }
            this.socket = newSocket;
            const socket = this.socket;
            exports.hlaeEmitter.emit('hlaeStatus', !!this.socket);
            if (!socket)
                return;
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
                            socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_hurt" "userid"\0', 'utf8')), { binary: true });
                            socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_hurt" "attacker"\0', 'utf8')), { binary: true });
                            socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enabled 1\0', 'utf8')), {
                                binary: true
                            });
                            socket.send(new Uint8Array(Buffer.from('transEnd\0', 'utf8')), { binary: true });
                            return;
                        }
                        const gameEvent = gameEventUnserializer.unserialize(bufferReader);
                        if (gameEvent.name === 'player_hurt') {
                            io.to('game').emit('mirv', gameEvent, 'player_hurt');
                        }
                        if (gameEvent.name === 'player_death') {
                            io.to('game').emit('update_mirv', gameEvent);
                            socket_1.GSI.digestMIRV(gameEvent);
                        }
                    }
                }
                catch (err) { }
            });
        });
    };
}
exports.MIRVPGL = MIRVPGL;
/*
const init = async () => {
    const io = await ioPromise;
    const enrichments = {
        player_death: ['userid', 'attacker', 'assister']
    };

    let socket: WebSocket;

    io.on('connection', (incoming: Socket) => {
        const newSocket = incoming?.client?.conn?.transport?.socket as WebSocket;
        const headers = incoming.request.headers;

        const isCSGO =
            !headers.referer &&
            !headers.accept &&
            !headers.origin &&
            !headers['accept-language'] &&
            !headers.pragma &&
            !headers['user-agent'];

        if (!isCSGO) {
            return;
        }

        if (socket) {
            socket.close();
            socket = newSocket;
        }
        socket = newSocket;

        const gameEventUnserializer = new GameEventUnserializer(enrichments);

        socket.on('message', data => {
            if (!(data instanceof Buffer)) {
                return;
            }
            const bufferReader = new BufferReader(Buffer.from(data));
            try {
                while (!bufferReader.eof()) {
                    const cmd = bufferReader.readCString();
                    if (cmd !== 'hello' && cmd !== 'gameEvent') {
                        return;
                    }
                    if (cmd === 'hello') {
                        const version = bufferReader.readUInt32LE();
                        if (2 != version) throw 'Error: version mismatch';
                        socket.send(new Uint8Array(Buffer.from('transBegin\0', 'utf8')), { binary: true });
                        socket.send(
                            new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich clientTime 1\0', 'utf8')),
                            { binary: true }
                        );
                        socket.send(
                            new Uint8Array(
                                Buffer.from(
                                    'exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "userid"\0',
                                    'utf8'
                                )
                            ),
                            { binary: true }
                        );
                        socket.send(
                            new Uint8Array(
                                Buffer.from(
                                    'exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "attacker"\0',
                                    'utf8'
                                )
                            ),
                            { binary: true }
                        );
                        socket.send(
                            new Uint8Array(
                                Buffer.from(
                                    'exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "assister"\0',
                                    'utf8'
                                )
                            ),
                            { binary: true }
                        );
                        socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enabled 1\0', 'utf8')), {
                            binary: true
                        });
                        socket.send(new Uint8Array(Buffer.from('transEnd\0', 'utf8')), { binary: true });
                        return;
                    }
                    const gameEvent = gameEventUnserializer.unserialize(bufferReader);
                    if (gameEvent.name === 'player_death') {
                        io.to('game').emit('update_mirv', gameEvent);
                    }
                }
            } catch (err) { }
        });
    });
};

export default init;*/
