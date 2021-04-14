import * as fs from 'fs';
import * as path from 'path';
import { app, shell, Notification } from 'electron';
import express, { request, RequestHandler } from 'express';
import * as I from './../../types/interfaces';
import { loadConfig, publicIP, internalIP } from './config';
import { HUDState, ioPromise } from './../socket';
import HUDWindow from './../../init/huds';
import overlay from './overlay';
import uuidv4 from 'uuid/v4';
import { api } from './user';
import archiver from 'archiver';
import { customer } from '.';

const DecompressZip = require('decompress-zip');

const getRandomString = () =>
	(Math.random() * 1000 + 1)
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substr(0, 15);

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

const verifyUniqueID = (hudDir: string) => {
	const dir = path.join(app.getPath('home'), 'HUDs', hudDir, 'uuid.lhm');
	if (fs.existsSync(dir)) {
		return fs.readFileSync(dir, 'utf8');
	}
	const uuid = uuidv4();
	fs.writeFileSync(dir, uuid, 'utf8');
	return uuid;
};

type OnlineHUDEntry = {
	uuid: string;
	id: number;
	game: I.AvailableGames;
	resource: string;
	data: number;
	extra: I.HUD;
};

const getOnlineHUDs = async () => {
	try {
		const onlineHUDData = ((await api(`storage/file`)) || []) as OnlineHUDEntry[];
		const huds = onlineHUDData.map(data => {
			const hud = {
				...data.extra,
				uuid: data.uuid
			} as I.HUD;
			return hud;
		});
		return huds;
	} catch {
		return [];
	}
};

export const listHUDs = async () => {
	const onlineHUDs = await getOnlineHUDs();

	const dir = path.join(app.getPath('home'), 'HUDs');
	const filtered = fs
		.readdirSync(dir, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.filter(dirent => /^[0-9a-zA-Z-_]+$/g.test(dirent.name));

	const huds = (await Promise.all(filtered.map(async dirent => await getHUDData(dirent.name)))).filter(
		hud => hud !== null
	) as I.HUD[];
	if (HUDState.devHUD) {
		huds.unshift(HUDState.devHUD);
	}

	const onlineOnlyHUDs = onlineHUDs.filter(hud => !huds.map(hud => hud.uuid).includes(hud.uuid));

	huds.push(...onlineOnlyHUDs);

	const mapHUDStatus = (hud: I.HUD) => {
		hud.status = 'LOCAL';
		if (onlineOnlyHUDs.map(hud => hud.uuid).includes(hud.uuid)) {
			hud.status = 'REMOTE';
		} else if (onlineHUDs.map(hud => hud.uuid).includes(hud.uuid)) {
			hud.status = 'SYNCED';
		}
		return hud;
	};
	return huds.map(mapHUDStatus);
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
		config.game = config.game || 'csgo';

		const panel = getHUDPanelSetting(dirName);
		const keybinds = getHUDKeyBinds(dirName);

		try {
			config.uuid = verifyUniqueID(dirName);
		} catch {
			return null;
		}

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

export const sendHUD: express.RequestHandler = async (req, res) => {
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

async function loadHUD(base64: string, name: string, existingUUID?: string): Promise<I.HUD | null> {
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

					fs.writeFileSync(path.join(hudPath, 'uuid.lhm'), existingUUID || uuidv4(), 'utf8');
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

type APIFileResponse = {
	data: (OnlineHUDEntry & { data: { type: string; data: number[] } | null }) | null;
};

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export const downloadHUD: RequestHandler = async (req, res) => {
	const uuid = req.params.uuid;
	if (!customer.game || !uuid) return res.sendStatus(422);
	await wait(3000);
	const hudData = ((await api(`storage/file/${customer.game}/hud/${uuid}`)) || null) as APIFileResponse | null;
	const name = hudData?.data?.extra?.name;

	if (hudData?.data?.data?.type !== 'Buffer' || !name) return res.sendStatus(422);

	const data = hudData.data.data;

	if (typeof data === 'number') return res.sendStatus(422);

	const hudBufferString = Buffer.from(data as any).toString('base64');

	const result = await loadHUD(hudBufferString, name, uuid);

	return res.json({ result });
};

const archiveHUD = (hudDir: string) =>
	new Promise<string>((res, rej) => {
		const dir = path.join(app.getPath('home'), 'HUDs', hudDir);

		const fileName = `${uuidv4()}.zip`;

		const archive = archiver('zip', {
			zlib: { level: 9 } // Sets the compression level.
		});

		const outputFilePath = path.join(app.getPath('home'), 'HUDs', fileName);

		const output = fs.createWriteStream(outputFilePath);

		output.on('close', () => res(outputFilePath));

		archive.pipe(output);

		archive.directory(dir, false);

		archive.finalize();
	});

export const uploadHUD: RequestHandler = async (req, res) => {
	const hudDir = req.params.hudDir;
	if (!customer.game || !hudDir) return res.sendStatus(422);

	const hud = await getHUDData(hudDir);

	if (!hud || !hud.uuid) return res.sendStatus(422);

	const archivePath = await archiveHUD(hudDir);
	const archiveBase64 = fs.readFileSync(archivePath, 'base64');

	const hudUploadResponse = await api(`storage/file/${customer.game}/hud/${hud.uuid}`, 'POST', {
		file: archiveBase64,
		extra: hud
	});
	fs.unlinkSync(archivePath);

	return res.json({ hudUploadResponse });
};

listHUDs().then(huds => huds.filter(hud => !!hud.dir).map(hud => verifyUniqueID(hud.dir)));
