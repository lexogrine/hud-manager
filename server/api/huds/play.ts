import express from 'express';
import { customer } from '..';
import { app } from '../..';
import { GSI, ioPromise, runtimeConfig, mirvPgl, Dota2GSI } from '../../socket';
import { testData } from '../testing';
import WebSocket from 'ws';
import { createDirector } from '../../aco';
import { PlayerExtension } from 'csgogsi-socket';
import { registerKeybind } from '../keybinder';
import { F1TelemetryClient, constants } from '@racehub-io/f1-telemetry-client';
import { existsSync, writeFileSync } from 'fs';
const { PACKETS } = constants;

const assertUser: express.RequestHandler = (req, res, next) => {
	if (!customer.customer) {
		return res.sendStatus(403);
	}
	return next();
};

export const playTesting: { intervalId: NodeJS.Timeout | null; isOnLoop: boolean } = {
	intervalId: null,
	isOnLoop: false
};

export const initGameConnection = async () => {
	const client = new F1TelemetryClient({ port: 20777 });

	const io = await ioPromise;

	const events = ['session', 'lapData', 'participants', 'carStatus', 'carTelemetry', 'sessionHistory'];

	for (const event of events) {
		client.on((PACKETS as any)[event as any], data => {
			io.to('f1').emit('update', { type: event, data });
		});
	}
	/*client.on(PACKETS.lapData, data => {
		io.to('f1').emit('update', { type: 'lap', data });
		lap = data;
		tryToSave();
	});
	client.on(PACKETS.session, data => {
		io.to('f1').emit('update', { type: 'session', data });
		session = data;
		tryToSave();
	});
	client.on(PACKETS.participants, data => {
		io.to('f1').emit('update', { type: 'participants', data });
		participants = data;
		tryToSave();
	});*/

	client.start();

	const director = createDirector();

	director.pgl = mirvPgl;

	const toggleDirector = () => {
		if (!customer.customer || !customer.customer.license || customer.customer.license?.type === 'free') {
			return;
		}
		director.status ? director.stop() : director.start();
		io.emit('directorStatus', director.status);
	};

	io.on('connection', socket => {
		socket.on('getDirectorStatus', () => {
			socket.emit('directorStatus', director.status);
		});
		socket.on('toggleDirector', toggleDirector);
	});

	registerKeybind('Left Alt+K', toggleDirector);

	let testDataIndex = 0;

	const startSendingTestData = () => {
		if (playTesting.intervalId) return;
		if (
			runtimeConfig.last?.provider?.timestamp &&
			new Date().getTime() - runtimeConfig.last.provider.timestamp * 1000 <= 5000
		)
			return;

		io.emit('enableTest', false, playTesting.isOnLoop);

		playTesting.intervalId = setInterval(() => {
			if (!testData[testDataIndex]) {
				testDataIndex = 0;
				if (!playTesting.isOnLoop) {
					stopSendingTestData();
					return;
				}
			}
			io.to('game').emit('update', testData[testDataIndex]);
			testDataIndex++;
		}, 16);
	};

	const stopSendingTestData = () => {
		if (!playTesting.intervalId) return;
		clearInterval(playTesting.intervalId);
		playTesting.intervalId = null;
		io.emit('enableTest', true, playTesting.isOnLoop);
	};
	app.post('/', assertUser, (req, res) => {
		runtimeConfig.last = req.body;

		if (playTesting.intervalId) {
			clearInterval(playTesting.intervalId);
			playTesting.intervalId = null;
			io.emit('enableTest', true, playTesting.isOnLoop);
		}

		io.to('game').emit('update', req.body);
		GSI.digest(req.body);
		res.sendStatus(200);
	});

	const replaceNameForPlayer = (steamid: string, username: string) => {
		mirvPgl?.socket?.send(
			new Uint8Array(Buffer.from(`exec\0mirv_replace_name filter add x${steamid} "${username}"\0`, 'utf8')),
			{ binary: true }
		);
	};

	app.post('/api/replaceWithMirv', assertUser, (req, res) => {
		const players = req.body.players as PlayerExtension[];
		if (
			!players ||
			!Array.isArray(players) ||
			!mirvPgl.socket ||
			mirvPgl.socket.readyState !== mirvPgl.socket.OPEN
		) {
			return res.sendStatus(403);
		}
		for (const player of players) {
			replaceNameForPlayer(player.steamid, player.name);
		}
		return res.sendStatus(200);
	});

	app.post('/dota2', assertUser, (req, res) => {
		runtimeConfig.last = req.body;
		io.to('dota2').emit('update', req.body);
		Dota2GSI.digest(req.body);
		res.sendStatus(200);
	});

	app.post('/api/test', assertUser, (_req, res) => {
		if (playTesting.intervalId) stopSendingTestData();
		else startSendingTestData();
		res.sendStatus(200);
	});

	app.post('/api/test/loop', assertUser, (_req, res) => {
		playTesting.isOnLoop = !playTesting.isOnLoop;
		io.emit('enableTest', !playTesting.intervalId, playTesting.isOnLoop);
		res.sendStatus(200);
	});

	const connectToRocketLeague = () => {
		const ws = new WebSocket('ws://localhost:49122');

		const onData = (data: WebSocket.Data) => {
			io.to('rocketleague').emit('update', data);
		};

		ws.on('message', onData);

		ws.on('close', () => {
			ws.off('message', onData);
			setTimeout(connectToRocketLeague, 1000);
		});

		ws.on('error', ws.close);
	};

	connectToRocketLeague();
};
