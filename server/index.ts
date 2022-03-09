/* eslint-disable no-console */
import express from 'express';
import getPort, { makeRange } from 'get-port';
import { app as application } from 'electron';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { ioPromise } from './socket';
import './sockets/index';
import router, { customer } from './api';
import { loadConfig, setConfig } from './api/config';
import { Config } from '../types/interfaces';
import { uploadAppUsage } from './api/appUsage';
import * as Sentry from '@sentry/node';
// import * as Tracing from '@sentry/tracing';

Sentry.init({
	dsn: 'https://a467f6451cab4fdcaa82ce545d367158@o955227.ingest.sentry.io/5934611',
	tracesSampleRate: 1.0
});

const parsePayload =
	(config: Config): express.RequestHandler =>
	(req, res, next) => {
		try {
			if (req.body) {
				const payload = req.body.toString();
				const obj = JSON.parse(payload);
				if (obj.provider && obj.provider.appid === 730) {
					if (config.token && (!obj.auth || !obj.auth.token)) {
						return res.sendStatus(200);
					}
					if (config.token && config.token !== obj.auth.token) {
						return res.sendStatus(200);
					}
				}
				const text = payload
					.replace(/"(player|owner)":([ ]*)([0-9]+)/gm, '"$1": "$3"')
					.replace(/(player|owner):([ ]*)([0-9]+)/gm, '"$1": "$3"');
				req.body = JSON.parse(text);
			}
			next();
		} catch (e) {
			next();
		}
	};

export const app = express();
export const server = http.createServer(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ limit: '100Mb', type: 'application/json' }));
app.use(cors({ origin: '*', credentials: true }));

export default async function init() {
	let config = await loadConfig();

	let port = await getPort({ port: config.port });
	if (port !== config.port) {
		port = await getPort({ port: makeRange(1300, 50000) });
		console.log(`Port ${config.port} is not available, changing to ${port}`);
		config = await setConfig({ ...config, port: port });
	}
	console.log(`Server listening on ${port}`);
	if (config.game) {
		customer.game = config.game;
	}
	app.use(parsePayload(config));

	await router();

	const io = await ioPromise;

	server.once('send-data-before-closing', () => {
		console.log('Preparing for closing!');
		uploadAppUsage().then((result: boolean) => {
			if (result) {
				console.log('Uploaded app usage!');
			} else {
				console.log('Failed to upload app usage!');
			}
			server.emit('sent-data-now-close');
		});
	});

	fs.watch(path.join(application.getPath('home'), 'HUDs'), () => {
		io.emit('reloadHUDs');
	});
	fs.watch(path.join(application.getPath('userData'), 'ARs'), () => {
		io.emit('reloadHUDs');
	});

	app.use('/', express.static(path.join(__dirname, '../build')));
	app.get('*', (_req, res) => {
		res.sendFile(path.join(__dirname, '../build/index.html'));
	});
	return server.listen(config.port);
}

process.on('unhandledRejection', err => {
	Sentry.captureException(err);
});

process.on('uncaughtException', err => {
	Sentry.captureException(err);
});
