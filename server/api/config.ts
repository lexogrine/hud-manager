import express from 'express';
import db from './../../init/database';
import fs from 'fs';
import ip from 'ip';
import { Config, ExtendedConfig } from '../../types/interfaces';
import publicIp from 'public-ip';
import internalIp from 'internal-ip';
import { isDev } from '../../electron';
import { ioPromise } from '../socket';

const configs = db.config;

export let publicIP: string | null = null;
export const internalIP = internalIp.v4.sync() || ip.address();

publicIp
	.v4()
	.then(ip => {
		publicIP = ip;
	})
	.catch();

const defaultConfig: Config = {
	steamApiKey: '',
	token: '',
	port: 1349,
	hlaePath: '',
	afxCEFHudInteropPath: '',
	sync: true
};

export const loadConfig = async (): Promise<Config> => {
	if (!publicIP) {
		try {
			publicIP = await publicIp.v4();
		} catch {}
	}
	return new Promise(res => {
		configs.find({}, async (err: any, config: Config[]) => {
			if (err) {
				return res(defaultConfig);
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
			configs.insert(defaultConfig, (err, config) => {
				if (err) {
					return res(defaultConfig);
				}
				return res(config);
			});
		});
	});
};

export const getConfig: express.RequestHandler = async (_req, res) => {
	const config = await loadConfig();
	if (!config) {
		return res.sendStatus(500);
	}
	const response: ExtendedConfig = { ...config, ip: internalIP };
	return res.json(response);
};
export const updateConfig: express.RequestHandler = async (req, res) => {
	const io = await ioPromise;
	const updated: Config = {
		steamApiKey: req.body.steamApiKey,
		port: Number(req.body.port),
		token: req.body.token,
		hlaePath: req.body.hlaePath,
		afxCEFHudInteropPath: req.body.afxCEFHudInteropPath,
		sync: !!req.body.sync
	};

	const config = await setConfig(updated);
	if (!config) {
		return res.sendStatus(500);
	}
	io.emit('config');
	return res.json(config);
};

export const setConfig = async (config: Config) =>
	new Promise<Config>(res => {
		configs.update({}, { $set: config }, {}, async err => {
			if (err) {
				return res(defaultConfig);
			}
			const newConfig = await loadConfig();
			if (!newConfig) {
				return res(defaultConfig);
			}
			return res(newConfig);
		});
	});

export const verifyUrl = async (url: string) => {
	if (!url || typeof url !== 'string') return false;
	const cfg = await loadConfig();
	if (!cfg) {
		return false;
	}
	const bases = [
		`http://${internalIP}:${cfg.port}`,
		`http://${publicIP}:${cfg.port}`,
		`http://localhost:${cfg.port}`
	];
	if (isDev) {
		bases.push(`http://localhost:3000/?port=${cfg.port}`);
	}
	if (bases.find(base => url.startsWith(`${base}/dev`))) {
		return true;
	}
	const base = bases.find(base => url.startsWith(base));
	if (!base) return false;
	let path = url.substr(base.length);
	if (!path || path === '/') return true;
	if (!path.endsWith(`/?port=${cfg.port}&isProd=true`)) return false;
	path = path.substr(0, path.lastIndexOf('/'));
	const pathRegex = /^\/huds\/([a-zA-Z0-9_-]+)$/;
	return pathRegex.test(path);
};
