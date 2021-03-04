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

export const initGameConnection = async () => {
	const io = await ioPromise;
	let intervalId: NodeJS.Timeout | null = null;
	let testDataIndex = 0;

	const startSendingTestData = () => {
		if (intervalId) return;
		if (
			runtimeConfig.last?.provider?.timestamp &&
			new Date().getTime() - runtimeConfig.last.provider.timestamp * 1000 <= 5000
		)
			return;

		io.emit('enableTest', false);

		intervalId = setInterval(() => {
			if (!testData[testDataIndex]) {
				stopSendingTestData();
				testDataIndex = 0;
				return;
			}
			io.to('csgo').emit('update', testData[testDataIndex]);
			testDataIndex++;
		}, 16);
	};

	const stopSendingTestData = () => {
		if (!intervalId) return;
		clearInterval(intervalId);
		intervalId = null;
		io.emit('enableTest', true);
	};
	app.post('/', assertUser, (req, res) => {
		if (!customer.customer) {
			return res.sendStatus(200);
		}
		runtimeConfig.last = req.body;

		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
			io.emit('enableTest', true);
		}

		io.to('csgo').emit('update', req.body);
		GSI.digest(req.body);
		radar.digestRadar(req.body);
		res.sendStatus(200);
	});

	app.post('/api/test', assertUser, (_req, res) => {
		res.sendStatus(200);
		if (intervalId) stopSendingTestData();
		else startSendingTestData();
	});
};
