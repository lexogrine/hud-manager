"use strict";
const bigInt = require("big-integer");
function findDelim(buffer, idx) {
    let delim = -1;
    for (let i = idx; i < buffer.length; ++i) {
        if (0 == buffer[i]) {
            delim = i;
            break;
        }
    }
    return delim;
}


const unserializeEnrichment = (bufferReader, keyValue) => {
    const xuid = bufferReader.readBigUInt64LE().toString();
    return {
        value: keyValue,
        xuid: xuid,
    };
}

class BufferReader {
    constructor(buffer) {
        this.buffer = buffer;
        this.index = 0;
    }
    readBigUInt64LE = (base) => {
        const lo = this.readUInt32LE();
        const hi = this.readUInt32LE();
        return bigInt(lo).or(bigInt(hi).shiftLeft(32));
    };
    readUInt32LE = () => {
        const result = this.buffer.readUInt32LE(this.index);
        this.index += 4;
        return result;
    };
    readInt32LE = () => {
        const result = this.buffer.readInt32LE(this.index);
        this.index += 4;
        return result;
    };
    readInt16LE = () => {
        const result = this.buffer.readInt16LE(this.index);
        this.index += 2;
        return result;
    };
    readInt8 = () => {
        const result = this.buffer.readInt8(this.index);
        this.index += 1;
        return result;
    };
    readUInt8 = () => {
        const result = this.buffer.readUInt8(this.index);
        this.index += 1;
        return result;
    };
    readBoolean = () => {
        return 0 != this.readUInt8();
    };
    readFloatLE = () => {
        const result = this.buffer.readFloatLE(this.index);
        this.index += 4;
        return result;
    };
    readCString = () => {
        const delim = findDelim(this.buffer, this.index);
        if (this.index <= delim) {
            const result = this.buffer.toString('utf8', this.index, delim);
            this.index = delim + 1;
            return result;
        }
        throw new "BufferReader.prototype.readCString";
    };
    eof = () => {
        return this.index >= this.buffer.length;
    };
}


class GameEventDescription {
    constructor(bufferReader) {
        this.eventId = bufferReader.readInt32LE();
        this.eventName = bufferReader.readCString();
        this.keys = [];
        this.enrichments = null;
        
        while (bufferReader.readBoolean()) {
            const keyName = bufferReader.readCString();
            const keyType = bufferReader.readInt32LE();
            this.keys.push({
                name: keyName,
                type: keyType
            });
        }
    }
    unserialize = (bufferReader) => {
        const clientTime = bufferReader.readFloatLE();
        const result = {
            name: this.eventName,
            clientTime: clientTime,
            keys: {}
        };
        for (let i = 0; i < this.keys.length; ++i) {
            const key = this.keys[i];

            const keyName = key.name;

            let keyValue;

            switch (key.type) {
                case 1:
                    keyValue = bufferReader.readCString();
                    break;
                case 2:
                    keyValue = bufferReader.readFloatLE();
                    break;
                case 3:
                    keyValue = bufferReader.readInt32LE();
                    break;
                case 4:
                    keyValue = bufferReader.readInt16LE();
                    break;
                case 5:
                    keyValue = bufferReader.readInt8();
                    break;
                case 6:
                    keyValue = bufferReader.readBoolean();
                    break;
                case 7:
                    keyValue = bufferReader.readBigUInt64LE();
                    break;
                default:
                    throw new "GameEventDescription.prototype.unserialize";
            }

			result.keys[key.name] = keyValue;
			
			if (this.enrichments && this.enrichments.includes(keyName)) {
				result.keys[key.name] = unserializeEnrichment(bufferReader, keyValue);
			}
        }
        return result;
    }
}

class GameEventUnserializer {
    constructor(enrichments) {
        this.enrichments = enrichments;

        this.knownEvents = {}; // id -> description	
    }
    unserialize = (bufferReader) => {
        const eventId = bufferReader.readInt32LE();

        if (eventId === 0) {
            const gameEvent = new GameEventDescription(bufferReader);

            this.knownEvents[gameEvent.eventId] = gameEvent;

            if (this.enrichments[gameEvent.eventName]) {
                gameEvent.enrichments = this.enrichments[gameEvent.eventName];
            }

            if (undefined === gameEvent)
                throw new "GameEventUnserializer.prototype.unserialize";

            const result = gameEvent.unserialize(bufferReader);
            return result;
        }
        const gameEvent = this.knownEvents[eventId];

        if (undefined === gameEvent)
            throw new "GameEventUnserializer.prototype.unserialize";

        const result = gameEvent.unserialize(bufferReader);
        return result;
    };
}


const init = (callback) => {
    const WSServer = require('ws').Server;
    const http = require('http');

    let ws = null;
    const server = http.createServer();
    const webSocketServer = new WSServer({ server, path: '/mirv' });

    const enrichments = {
        player_death: ['userid', 'attacker', 'assister']
    }
    webSocketServer.on('connection', function (newWs) {
        if (ws) {
            ws.close();
            ws = newWs;
        }
        ws = newWs;
        const gameEventUnserializer = new GameEventUnserializer(enrichments);
        ws.on('message', function (data) {
            if (data instanceof Buffer) {
                const bufferReader = new BufferReader(Buffer.from(data));
                try {
                    while (!bufferReader.eof()) {
                        const cmd = bufferReader.readCString();
                        switch (cmd) {
                            case 'hello':
                                {
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
                                }
                                break;
                            case 'gameEvent':
                                {
                                    const gameEvent = gameEventUnserializer.unserialize(bufferReader);
                                    if (gameEvent.name === "player_death") {
                                        console.log(gameEvent)
                                        if (callback) {
                                            callback(gameEvent);
                                        }
                                        //console.log(JSON.stringify(gameEvent));
                                    }
                                }
                                break;
                            default:
                            //throw "Error: unknown message";
                        }
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
        });
    });
    server.listen(31337);
}
exports["default"] = init;
