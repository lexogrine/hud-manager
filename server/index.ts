/* eslint-disable no-console */
import express from 'express';
import sockets from './sockets';
import http from 'http';
import cors from 'cors';
import getPort, { makeRange } from 'get-port';
import router from './api';
import path from 'path';
import { app as application } from 'electron';
import { autoUpdater } from 'electron-updater';
import fs from 'fs';
import { loadConfig, setConfig } from './api/config';

export default async function init() {
	autoUpdater.on('update-available', (info: any) => {
		console.log("Update available")
		console.log(info)
	})
	autoUpdater.on('update-downloaded', (info: any) => {
		console.log('downbloaded');
		console.log(info)
	});
	
	autoUpdater.on('checking-for-update', (info: any) => {
		console.log('checking');
		console.log(info)
	});

	let config = await loadConfig();
	const app = express();
	const server = http.createServer(app);

	let port = await getPort({ port: config.port });
	if (port !== config.port) {
		port = await getPort({ port: makeRange(1300, 50000) });
		console.log(`Port ${config.port} is not available, changing to ${port}`);
		config = await setConfig({ ...config, port: port });
	}
	console.log(`Server listening on ${port}`);
	autoUpdater.checkForUpdatesAndNotify()

	app.use(express.urlencoded({ extended: true }));
	app.use(express.raw({ limit: '100Mb', type: 'application/json' }));
	app.use((req, res, next) => {
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
	});
	app.use(cors({ origin: '*', credentials: true }));

	const io = sockets(server, app);

	router(app, io);

	fs.watch(path.join(application.getPath('home'), 'HUDs'), () => {
		io.emit('reloadHUDs');
	});

	app.use('/', express.static(path.join(__dirname, '../build')));
	app.get('*', (_req, res) => {
		res.sendFile(path.join(__dirname, '../build/index.html'));
	});
	return server.listen(config.port);
}
