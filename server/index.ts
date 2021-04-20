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
import router from './api';
import { loadConfig, setConfig } from './api/config';
import { Config } from '../types/interfaces';

const parsePayload = (config: Config): express.RequestHandler => (req, res, next) => {
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
	app.use(parsePayload(config));

	router();

	const io = await ioPromise;

	fs.watch(path.join(application.getPath('home'), 'HUDs'), () => {
		io.emit('reloadHUDs');
	});

	app.use('/', express.static(path.join(__dirname, '../build')));
	app.get('*', (_req, res) => {
		res.sendFile(path.join(__dirname, '../build/index.html'));
	});
	return server.listen(config.port);
}
