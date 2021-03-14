import * as fs from 'fs';
import * as path from 'path';
import { app, shell, Notification } from 'electron';
import express, { request } from 'express';
import * as I from './../../types/interfaces';
import { loadConfig, publicIP, internalIP } from './config';
import { HUDState, ioPromise } from './../socket';
import HUDWindow from './../../init/huds';
import overlay from './overlay';

const DecompressZip = require('decompress-zip');

const remove = (pathToRemove: string) => {
	if (!fs.existsSync(pathToRemove)) {
		return;
	}
	const files = fs.readdirSync(pathToRemove);
	files.forEach(function (file) {
		const current = path.join(pathToRemove, file);
		if (fs.lstatSync(current).isDirectory()) {
			// recurse
			remove(current);
			if (fs.existsSync(current)) fs.rmdirSync(current);
		} else {
			// delete file
			if (fs.existsSync(current)) fs.unlinkSync(current);
		}
	});
	fs.rmdirSync(pathToRemove);
};

export const listHUDs = async () => {
	const dir = path.join(app.getPath('home'), 'HUDs');
	const filtered = fs
		.readdirSync(dir, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.filter(dirent => /^[0-9a-zA-Z-_]+$/g.test(dirent.name));

	const huds = (await Promise.all(filtered.map(async dirent => await getHUDData(dirent.name)))).filter(
		hud => hud !== null
	);
	if (HUDState.devHUD) {
		huds.unshift(HUDState.devHUD);
	}
	return huds;
};

export const getHUDs: express.RequestHandler = async (req, res) => {
	return res.json(await listHUDs());
};

export const getHUDData = async (dirName: string): Promise<I.HUD | null> => {
	const dir = path.join(app.getPath('home'), 'HUDs', dirName);
	const configFileDir = path.join(dir, 'hud.json');
	const globalConfig = await loadConfig();
	if (!globalConfig) return null;
	if (!fs.existsSync(configFileDir)) {
		if (!HUDState.devHUD) return null;
		if (HUDState.devHUD.dir === dirName) {
			return HUDState.devHUD;
		}
		return null;
	}
	try {
		const configFile = fs.readFileSync(configFileDir, { encoding: 'utf8' });
		const config = JSON.parse(configFile);
		config.dir = dirName;

		const panel = getHUDPanelSetting(dirName);
		const keybinds = getHUDKeyBinds(dirName);

		if (panel) {
			config.panel = panel;
		}
		if (keybinds) {
			config.keybinds = keybinds;
		}

		config.url = `http://${internalIP}:${globalConfig.port}/hud/${dirName}/`;
		config.isDev = false;

		return config;
	} catch (e) {
		return null;
	}
};

export const getHUDKeyBinds = (dirName: string) => {
	const dir = path.join(app.getPath('home'), 'HUDs', dirName);
	const keybindsFileDir = path.join(dir, 'keybinds.json');
	if (!fs.existsSync(keybindsFileDir)) {
		return null;
	}
	try {
		const keybindsFile = fs.readFileSync(keybindsFileDir, { encoding: 'utf8' });
		const keybinds = JSON.parse(keybindsFile);
		return keybinds;
	} catch (e) {
		return null;
	}
};

export const getHUDPanelSetting = (dirName: string) => {
	const dir = path.join(app.getPath('home'), 'HUDs', dirName);
	const panelFileDir = path.join(dir, 'panel.json');
	if (!fs.existsSync(panelFileDir)) {
		return null;
	}
	try {
		const panelFile = fs.readFileSync(panelFileDir, { encoding: 'utf8' });
		const panel = JSON.parse(panelFile);
		panel.dir = dirName;
		return panel;
	} catch (e) {
		return null;
	}
};

export const openHUDsDirectory: express.RequestHandler = async (_req, res) => {
	const dir = path.join(app.getPath('home'), 'HUDs');
	shell.openPath(dir);
	return res.sendStatus(200);
};

export const renderHUD: express.RequestHandler = async (req, res, next) => {
	const cfg = await loadConfig();
	if (!cfg) {
		return res.sendStatus(500);
	}
	const availableUrls = [
		`http://${internalIP}:${cfg.port}/hud/${req.params.dir}/`,
		`http://${publicIP}:${cfg.port}/hud/${req.params.dir}/`,
		`http://localhost:${cfg.port}/hud/${req.params.dir}/`
	];
	if (!req.params.dir) {
		return res.sendStatus(404);
	}

	if (!req.headers?.referer) {
		return res.sendStatus(403);
	}

	if (!availableUrls.includes(req.headers.referer)) {
		return res.status(403).json({
			expected: availableUrls,
			given: req.headers.referer
		});
	}
	const data = await getHUDData(req.params.dir);
	if (!data) {
		return res.sendStatus(404);
	}
	if (data.legacy) {
		return renderLegacy(req, res, next);
	}
	return render(req, res, next);
};

export const verifyOverlay: express.RequestHandler = async (req, res, next) => {
	const cfg = await loadConfig();
	if (!cfg) {
		return res.sendStatus(500);
	}
	const requestUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

	const availableUrls = [
		`http://${internalIP}:${cfg.port}/dev`,
		`http://${publicIP}:${cfg.port}/dev`,
		`http://localhost:${cfg.port}/dev`
	];
	if (
		requestUrl === `http://localhost:${cfg.port}/dev/thumb.png` ||
		availableUrls.find(url => `${url}/thumb.png` === requestUrl)
	) {
		return next();
	}
	if (availableUrls.every(url => !(req.headers.referer || '').startsWith(url))) {
		return res.status(403).json({
			expected: availableUrls,
			given: req.headers.referer
		});
	}

	return next();
};

export const render: express.RequestHandler = (req, res) => {
	const dir = path.join(app.getPath('home'), 'HUDs', req.params.dir);
	return res.sendFile(path.join(dir, 'index.html'));
};

export const renderOverlay = (devHUD = false): express.RequestHandler => async (req, res) => {
	const cfg = await loadConfig();
	if (!cfg) {
		return res.sendStatus(500);
	}
	if (!devHUD) {
		return res.send(overlay(`/huds/${req.params.dir}/?port=${cfg.port}&isProd=true`));
	}
	return res.send(overlay(`/dev/?port=${cfg.port}`));
};

export const renderThumbnail: express.RequestHandler = (req, res) => {
	return res.sendFile(getThumbPath(req.params.dir));
};

export const getThumbPath = (dir: string) => {
	const thumbPath = path.join(app.getPath('home'), 'HUDs', dir, 'thumb.png');
	if (fs.existsSync(thumbPath)) {
		return thumbPath;
	}
	return path.join(__dirname, '../../assets/icon.png');
};

export const renderAssets: express.RequestHandler = async (req, res, next) => {
	if (!req.params.dir) {
		return res.sendStatus(404);
	}
	const data = await getHUDData(req.params.dir);
	if (!data) {
		return res.sendStatus(404);
	}
	return express.static(path.join(app.getPath('home'), 'HUDs', req.params.dir))(req, res, next);
};

export const renderLegacy: express.RequestHandler = async (req, res) => {
	const cfg = await loadConfig();
	if (!cfg) {
		return res.sendStatus(500);
	}
	const dir = path.join(app.getPath('home'), 'HUDs', req.params.dir);
	return res.render(path.join(dir, 'template.pug'), {
		ip: 'localhost',
		port: cfg.port,
		avatars: false,
		hud: path.join('/huds', req.params.dir, 'index.js'),
		css: path.join('/huds', req.params.dir, 'style.css'),
		delay: 0
	});
};

export const legacyJS: express.RequestHandler = (req, res) => {
	const dir = path.join(app.getPath('home'), 'HUDs', req.params.hudName, 'index.js');
	if (!fs.existsSync(dir)) {
		return res.sendStatus(404);
	}
	try {
		const file = fs.readFileSync(dir, { encoding: 'utf8' });
		res.setHeader('Content-Type', 'application/javascript');
		return res.end(file);
	} catch (e) {
		return res.sendStatus(404);
	}
};
export const legacyCSS: express.RequestHandler = (req, res) => {
	const dir = path.join(app.getPath('home'), 'HUDs', req.params.hudName, 'style.css');
	if (!fs.existsSync(dir)) {
		return res.sendStatus(404);
	}
	try {
		const file = fs.readFileSync(dir, { encoding: 'utf8' });
		res.setHeader('Content-Type', 'text/css');
		return res.end(file);
	} catch (e) {
		return res.sendStatus(404);
	}
};

export const showHUD: express.RequestHandler = async (req, res) => {
	const response = await HUDWindow.open(req.params.hudDir);
	if (response) {
		return res.sendStatus(200);
	}
	return res.sendStatus(404);
};

export const closeHUD: express.RequestHandler = (req, res) => {
	const response = HUDWindow.close();
	if (response) {
		return res.sendStatus(200);
	}
	return res.sendStatus(404);
};

export const uploadHUD: express.RequestHandler = async (req, res) => {
	if (!req.body.hud || !req.body.name) return res.sendStatus(422);
	const response = await loadHUD(req.body.hud, req.body.name);
	if (response) {
		const notification = new Notification({
			title: 'HUD Upload',
			body: `${response.name} uploaded successfully`,
			icon: getThumbPath(response.dir)
		});
		notification.show();
	}
	return res.sendStatus(response ? 200 : 500);
};

export const deleteHUD: express.RequestHandler = async (req, res) => {
	const io = await ioPromise;
	if (!req.query.hudDir || typeof req.query.hudDir !== 'string' || HUDWindow.current) return res.sendStatus(422);
	const hudPath = path.join(app.getPath('home'), 'HUDs', req.query.hudDir);
	if (!fs.existsSync(hudPath)) {
		return res.sendStatus(200);
	}
	try {
		remove(hudPath);
		io.emit('reloadHUDs');
		return res.sendStatus(200);
	} catch {
		return res.sendStatus(500);
	}
};

function removeArchives() {
	const files = fs.readdirSync('./').filter(file => file.startsWith('hud_temp_') && file.endsWith('.zip'));
	files.forEach(file => {
		try {
			if (fs.lstatSync(file).isDirectory()) {
				return;
			}
			if (fs.existsSync(file)) fs.unlinkSync(file);
		} catch {}
	});
}

async function loadHUD(base64: string, name: string): Promise<I.HUD | null> {
	const getRandomString = () =>
		(Math.random() * 1000 + 1)
			.toString(36)
			.replace(/[^a-z]+/g, '')
			.substr(0, 15);
	removeArchives();
	return new Promise(res => {
		let hudDirName = name.replace(/[^a-zA-Z0-9-_]/g, '');
		let hudPath = path.join(app.getPath('home'), 'HUDs', hudDirName);
		if (fs.existsSync(hudPath)) {
			hudDirName = `${hudDirName}-${getRandomString()}`;
			hudPath = path.join(app.getPath('home'), 'HUDs', hudDirName);
		}
		try {
			const fileString = base64.split(';base64,').pop();
			const tempArchiveName = `./hud_temp_archive_${getRandomString()}.zip`;
			fs.writeFileSync(tempArchiveName, fileString, { encoding: 'base64', mode: 777 });

			const tempUnzipper: any = new DecompressZip(tempArchiveName);
			tempUnzipper.on('extract', async () => {
				if (fs.existsSync(path.join(hudPath, 'hud.json'))) {
					const hudFile = fs.readFileSync(path.join(hudPath, 'hud.json'), { encoding: 'utf8' });
					const hud = JSON.parse(hudFile);
					if (!hud.name) {
						throw new Error();
					}
					const hudData = await getHUDData(path.basename(hudPath));
					removeArchives();
					res(hudData);
				} else {
					throw new Error();
				}
			});
			tempUnzipper.on('error', () => {
				if (fs.existsSync(hudPath)) {
					remove(hudPath);
				}
				removeArchives();
				res(null);
			});
			tempUnzipper.extract({
				path: hudPath
			});
			/**/
		} catch {
			if (fs.existsSync(hudPath)) {
				remove(hudPath);
			}
			removeArchives();
			res(null);
		}
	});
}
