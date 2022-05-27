import WebSocket from 'ws';
import { Server } from 'socket.io';
import BufferReader from './BufferReader';
import GameEventUnserializer, { EnrichmentObject } from './GameEventUnserializer';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GSI } from '../socket';
import { RawKill } from 'csgogsi-socket';
import EventEmitter from 'events';

export const hlaeEmitter = new EventEmitter();

const knownGameEvents: string[] = [];

type EnrichmentDetails = {
	[eventName: string]: {
		[key: string]: string | string[]
	}
}

const parseEnrichmentList = (enrichmentList: EnrichmentDetails): EnrichmentObject => {
	const enrichments: EnrichmentObject = {};

	for(const [eventName, keys] of Object.entries(enrichmentList)){
		enrichments[eventName] = Object.keys(keys);
	}

	return enrichments;
}

const enrichmentList: EnrichmentDetails = {
	player_death: {
		userid: 'useridWithSteamId',
		attacker: 'useridWithSteamId',
		assister: 'useridWithSteamId',
	},
	player_hurt: {
		userid: 'useridWithSteamId',
		attacker: 'useridWithSteamId',
	},
	weaponhud_selection: {
		userid: 'useridWithSteamId',
	}
}
export class MIRVPGL {
	socket: WebSocket | null;
	constructor(ioPromise: Promise<Server<DefaultEventsMap, DefaultEventsMap>>) {
		this.socket = null;
		hlaeEmitter.emit('hlaeStatus', !!this.socket);
		this.init(ioPromise);
	}

	execute = (config: string) => {
		if (!this.socket) return;
		this.socket.send(new Uint8Array(Buffer.from(`exec\0${config}\0`, 'utf8')), { binary: true });
	};

	private init = async (ioPromise: Promise<Server<DefaultEventsMap, DefaultEventsMap>>) => {
		const io = await ioPromise;
		//const test = enrichmentList
		/*const enrichments = {
			player_death: ['userid', 'attacker', 'assister'],
			player_hurt: ['userid', 'attacker']
		};*/

		const enrichments = parseEnrichmentList(enrichmentList);

		io.on('connection', incoming => {
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

			newSocket.on('close', () => {
				this.socket = null;
				hlaeEmitter.emit('hlaeStatus', !!this.socket);
			});

			if (this.socket) {
				this.socket.close();
			}
			this.socket = newSocket;

			const socket = this.socket;

			hlaeEmitter.emit('hlaeStatus', !!this.socket);

			if (!socket) return;

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

							for (const [eventName, enrichments] of Object.entries(enrichmentList)) {
								for (const [keyName, enrichmentNames] of Object.entries(enrichments)) {
									const enrichmentProperties = Array.isArray(enrichmentNames) ? enrichmentNames : [enrichmentNames];

									for (const enrichment of enrichmentProperties) {

										socket.send(
											new Uint8Array(
												Buffer.from(
													`exec\0mirv_pgl events enrich eventProperty "${enrichment}" "${eventName}" "${keyName}"\0`,
													'utf8'
												)
											),
											{ binary: true }
										);
									}
								}
							}
							socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enabled 1\0', 'utf8')), {
								binary: true
							});

							//socket.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events useCache 1\0', 'utf8')), { binary: true });
							socket.send(new Uint8Array(Buffer.from('transEnd\0', 'utf8')), { binary: true });
							return;
						}
						const gameEvent = gameEventUnserializer.unserialize(bufferReader);

						if (gameEvent.name === 'player_hurt') {
							io.to('game').emit('mirv', gameEvent, 'player_hurt');
						}
						if (gameEvent.name === 'player_death') {
							io.to('game').emit('update_mirv', gameEvent);
							GSI.digestMIRV(gameEvent as RawKill);
						}
					}
				} catch (err) { }
			});
		});
	};
}
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
