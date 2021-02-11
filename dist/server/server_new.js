"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const BufferReader_1 = __importDefault(require("./hlae/BufferReader"));
const GameEventUnserializer_1 = __importDefault(require("./hlae/GameEventUnserializer"));
const initiateMirv = (callback) => {
    let ws = null;
    const server = http_1.default.createServer();
    const wss = new ws_1.Server({ server: server, path: '/mirv' });
    const enrichments = {
        'player_death': [
            'userid',
            'attacker',
            'assister',
        ]
    };
    wss.on('connection', (websocket) => {
        if (ws) {
            ws.close();
        }
        ws = websocket;
        const gameEventUnserializer = new GameEventUnserializer_1.default(enrichments);
        websocket.on("message", data => {
            if (!(data instanceof Buffer)) {
                return;
            }
            const bufferReader = new BufferReader_1.default(Buffer.from(data));
            try {
                while (!bufferReader.eof()) {
                    const cmd = bufferReader.readCString();
                    if (cmd !== "hello" && cmd !== "gameEvent") {
                        return;
                    }
                    if (cmd === "hello") {
                        const version = bufferReader.readUInt32LE();
                        if (2 != version)
                            throw "Error: version mismatch";
                        ws.send(new Uint8Array(Buffer.from('transBegin\0', 'utf8')), { binary: true });
                        ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich clientTime 1\0', 'utf8')), { binary: true });
                        ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "userid"\0', 'utf8')), { binary: true });
                        ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "attacker"\0', 'utf8')), { binary: true });
                        ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "assister"\0', 'utf8')), { binary: true });
                        ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enabled 1\0', 'utf8')), { binary: true });
                        ws.send(new Uint8Array(Buffer.from('transEnd\0', 'utf8')), { binary: true });
                        return;
                    }
                    const gameEvent = gameEventUnserializer.unserialize(bufferReader);
                    //console.log(gameEvent)
                    if (gameEvent.name === "player_death") {
                        callback(gameEvent);
                    }
                    return;
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    });
    server.listen(31337);
};
exports.default = initiateMirv;
