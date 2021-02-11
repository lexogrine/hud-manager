import { Server } from 'ws';
import http from 'http';
import BufferReader from './hlae/BufferReader';
import GameEventUnserializer from './hlae/GameEventUnserializer';

const initiateMirv = (callback: Function) => {
	let ws: any = null;

	const server = http.createServer();
	const wss = new Server({ server: server, path: '/mirv' });

	const enrichments = {
		player_death: ['userid', 'attacker', 'assister']
	};

	wss.on('connection', websocket => {
		if (ws) {
			ws.close();
		}
		ws = websocket;

		const gameEventUnserializer = new GameEventUnserializer(enrichments);

		websocket.on('message', data => {
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

						ws.send(new Uint8Array(Buffer.from('transBegin\0', 'utf8')), { binary: true });

						ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich clientTime 1\0', 'utf8')), {
							binary: true
						});

						ws.send(
							new Uint8Array(
								Buffer.from(
									'exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "userid"\0',
									'utf8'
								)
							),
							{ binary: true }
						);

						ws.send(
							new Uint8Array(
								Buffer.from(
									'exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "attacker"\0',
									'utf8'
								)
							),
							{ binary: true }
						);

						ws.send(
							new Uint8Array(
								Buffer.from(
									'exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "assister"\0',
									'utf8'
								)
							),
							{ binary: true }
						);

						ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enabled 1\0', 'utf8')), {
							binary: true
						});

						ws.send(new Uint8Array(Buffer.from('transEnd\0', 'utf8')), { binary: true });

						return;
					}
					const gameEvent = gameEventUnserializer.unserialize(bufferReader);
					//console.log(gameEvent)
					if (gameEvent.name === 'player_death') {
						callback(gameEvent);
					}
					return;
				}
			} catch (err) {
				console.log(err);
			}
		});
	});
	server.listen(31337);
};

export default initiateMirv;
