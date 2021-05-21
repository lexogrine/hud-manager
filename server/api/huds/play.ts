import express from 'express';
import { customer } from '..';
import { app } from '../..';
import { GSI, ioPromise, runtimeConfig, mirvPgl } from '../../socket';
import { testData } from '../testing';
import WebSocket from 'ws';
import { createDirector } from '../../aco';

const radar = require('./../../../boltobserv/index.js');

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
	const io = await ioPromise;

	const director = createDirector();

	director.pgl = mirvPgl;

	io.on('connection', socket => {
		socket.on('getDirectorStatus', () => {
			socket.emit('directorStatus', director.status);
		});
		socket.on('toggleDirector', () => {
			if (
				!customer.customer ||
				!customer.customer.license ||
				customer.customer.license?.type === 'free' ||
				customer.customer.license?.type === 'personal'
			) {
				return;
			}
			director.status ? director.stop() : director.start();
			socket.emit('directorStatus', director.status);
		});
	});

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
		radar.digestRadar(req.body);
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
