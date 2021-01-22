import express from 'express';
import db from './../../init/database';
import fs from 'fs';
import ip from 'ip';
import socketio from 'socket.io';
import { Config, ExtendedConfig } from '../../types/interfaces';

const configs = db.config;

export const loadConfig = async (): Promise<Config | null> => {
	return new Promise(res => {
		configs.find({}, async (err, config) => {
			if (err) {
				return res(null);
			}
			if (config.length) {
				if (
					(!config[0].hlaePath || fs.existsSync(config[0].hlaePath)) &&
					(!config[0].afxCEFHudInteropPath || fs.existsSync(config[0].afxCEFHudInteropPath))
				) {
					return res(config[0]);
				}
				if (config[0].hlaePath && !fs.existsSync(config[0].hlaePath)) {
					config[0].hlaePath = '';
				}

				if (config[0].afxCEFHudInteropPath && !fs.existsSync(config[0].afxCEFHudInteropPath)) {
					config[0].afxCEFHudInteropPath = '';
				}

				return res(await setConfig(config[0]));
			}
			configs.insert(
				{ steamApiKey: '', token: '', port: 1349, hlaePath: '', afxCEFHudInteropPath: '' },
				(err, config) => {
					if (err) {
						return res(null);
					}
					return res(config);
				}
			);
		});
	});
};

export const getConfig: express.RequestHandler = async (_req, res) => {
	const config = await loadConfig();
	if (!config) {
		return res.sendStatus(500);
	}
	const response: ExtendedConfig = { ...config, ip: ip.address() };
	return res.json(response);
};
export const updateConfig = (io: socketio.Server): express.RequestHandler => async (req, res) => {
	const updated: Config = {
		steamApiKey: req.body.steamApiKey,
		port: Number(req.body.port),
		token: req.body.token,
		hlaePath: req.body.hlaePath,
		afxCEFHudInteropPath: req.body.afxCEFHudInteropPath
	};

	const config = await setConfig(updated);
	if (!config) {
		return res.sendStatus(500);
	}
	io.emit('config');
	return res.json(config);
};

export const setConfig = async (config: Config) =>
	new Promise<Config | null>(res => {
		configs.update({}, { $set: config }, {}, async err => {
			if (err) {
				return res(null);
			}
			const newConfig = await loadConfig();
			if (!newConfig) {
				return res(null);
			}
			return res(newConfig);
		});
	});
