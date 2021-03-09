import express from 'express';
import { customer } from '..';
import { app } from '../..';
import { GSI, ioPromise, runtimeConfig } from '../../socket';
import { testData } from '../testing';
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
			io.to('csgo').emit('update', testData[testDataIndex]);
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
		if (!customer.customer) {
			return res.sendStatus(200);
		}
		runtimeConfig.last = req.body;

		if (playTesting.intervalId) {
			clearInterval(playTesting.intervalId);
			playTesting.intervalId = null;
			io.emit('enableTest', true, playTesting.isOnLoop);
		}

		io.to('csgo').emit('update', req.body);
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
};
