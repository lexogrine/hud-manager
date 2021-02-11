import BufferReader from './hlae/BufferReader';
import GameEventUnserializer from './hlae/GameEventUnserializer';

const init = (callback: any) => {
    const WSServer = require('ws').Server;
    const http = require('http');

    let ws: any = null;
    const server = http.createServer();
    const webSocketServer = new WSServer({ server, path: '/mirv' });

    const enrichments = {
        player_death: ['userid', 'attacker', 'assister']
    }
    webSocketServer.on('connection', function (newWs: any) {
        if (ws) {
            ws.close();
            ws = newWs;
        }
        ws = newWs;
        const gameEventUnserializer = new GameEventUnserializer(enrichments);
        ws.on('message', function (data: any) {
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
export default init;
