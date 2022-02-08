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
import isSvg from '../../src/isSvg';
import fetch from 'node-fetch';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
const DecompressZip = require('decompress-zip');

export const getRandomString = () =>
	(Math.random() * 1000 + 1)
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substr(0, 15);

export const remove = (pathToRemove: string) => {
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
	if (!customer.game) return [];
	try {
		let url = `storage/file/${customer.game}`;

		if (customer.customer && customer.workspace) {
			url += `?&teamId=${customer.workspace.id}`;
		}
		const onlineHUDData = ((await api(url)) || []) as OnlineHUDEntry[];
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
	if (!customer || !customer.game) return [];
	const onlineHUDs = await getOnlineHUDs();

	const dir = path.join(app.getPath('home'), 'HUDs');

	const filtered = fs.existsSync(dir)
		? fs
				.readdirSync(dir, { withFileTypes: true })
				.filter(dirent => dirent.isDirectory())
				.filter(dirent => /^[0-9a-zA-Z-_]+$/g.test(dirent.name))
		: [];

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
	return huds
		.map(mapHUDStatus)
		.filter(hud => customer.game === hud.game || (customer.game === 'csgo' && !hud.game) || hud.game === 'all');
};

export const getHUDs: express.RequestHandler = async (req, res) => {
	return res.json(await listHUDs());
};
const isJSON = (data: any) => {
	if (!data || typeof data !== 'string') return false;
	try {
		const json = JSON.parse(data);
		return true;
	} catch {
		return false;
	}
};
export const getHUDCustomAsset: express.RequestHandler = async (req, res) => {
	const { section, asset } = req.params;
	const isDev = req.query.isDev === 'true';
	let { hudDir } = req.params;

	if (isDev && HUDState.devHUD?.dir) {
		hudDir = HUDState.devHUD.dir;
	}

	const hudData = HUDState.get(hudDir, true);
	const data = hudData?.[section]?.[asset];

	const panel = isDev ? HUDState?.devHUD?.panel || [] : ((await getHUDPanelSetting(hudDir)) as I.PanelTemplate[]);
	if (!data) {
		return res.sendStatus(404);
	}
	if (isJSON(data)) {
		return res.json(data);
	}
	if (!panel || !Array.isArray(panel)) {
		return res.send(data);
	}

	const sectionEntry = panel.find(sectionData => sectionData.name === section);
	if (!sectionEntry) {
		return res.send(data);
	}
	const inputEntry = sectionEntry.inputs.find(inputData => inputData.name === asset);
	if (!inputEntry || inputEntry.type !== 'image') {
		return res.send(data);
	}

	const imgBuffer = Buffer.from(data, 'base64');
	res.writeHead(200, {
		'Content-Type': isSvg(imgBuffer) ? 'image/svg+xml' : 'image/png',
		'Content-Length': imgBuffer.length
	});
	return res.end(imgBuffer);
};

export const getHUDARSettings = (dirName: string) => {
	const dir = path.join(app.getPath('home'), 'HUDs', dirName);
	const arFileDir = path.join(dir, 'ar.json');
	if (!fs.existsSync(arFileDir)) {
		return null;
	}
	try {
		const arFile = fs.readFileSync(arFileDir, { encoding: 'utf8' });
		const ar = JSON.parse(arFile);
		return ar;
	} catch (e) {
		return null;
	}
};

const getHUDPublicKey = (dirName: string) => {
	const dir = path.join(app.getPath('home'), 'HUDs', dirName);
	const keyFile = path.join(dir, 'key');
	if (!fs.existsSync(keyFile)) {
		return null;
	}
	try {
		const key = fs.readFileSync(keyFile, 'utf8');
		return key;
	} catch (e) {
		return null;
	}
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
		let configFile = fs.readFileSync(configFileDir, { encoding: 'utf8' });
		const publicKey = getHUDPublicKey(dirName);
		if (publicKey) {
			const content = jwt.verify(configFile, publicKey, { algorithms: ['RS256'] }) as any;
			if (typeof content !== 'string' && !content.name && !content.version) return null;
			configFile = content;
		}
		const config = typeof configFile === 'string' ? JSON.parse(configFile) : (configFile as I.HUD);
		config.dir = dirName;
		config.game = config.game || 'csgo';
		config.publicKey = getHUDPublicKey(dirName);

		const panel = getHUDPanelSetting(dirName);
		const keybinds = getHUDKeyBinds(dirName);
		const ar = getHUDARSettings(dirName);

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
		if (ar) {
			config.ar = ar;
		}

		config.url = `http://${internalIP}:${globalConfig.port}/hud/${dirName}/`;
		config.isDev = false;

		return config;
	} catch (e) {
		console.log(e);
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
		const keybinds = JSON.parse(keybindsFile) as I.KeyBind[];
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
		requestUrl.startsWith(`http://localhost:${cfg.port}/dev/ar/`) ||
		availableUrls.find(url => requestUrl.startsWith(`${url}/ar/`))
	) {
		return next();
	}
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

export const renderOverlay =
	(devHUD = false): express.RequestHandler =>
	async (req, res) => {
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
	const filePath = path.join(app.getPath('home'), 'HUDs', data.dir, req.url);

	if ((!req.url.endsWith('.js') && !req.url.endsWith('.css')) || !data.publicKey || !fs.existsSync(filePath)) {
		return express.static(path.join(app.getPath('home'), 'HUDs', req.params.dir))(req, res, next);
	}

	try {
		const signedFileContent = fs.readFileSync(filePath, 'utf8');
		const content = jwt.verify(signedFileContent, data.publicKey, { algorithms: ['RS256'] });

		if (typeof content !== 'string') return res.sendStatus(404);

		res.setHeader('Content-Type', req.url.endsWith('.js') ? 'application/javascript' : 'text/css');

		return res.send(content);
	} catch {
		return res.sendStatus(404);
	}
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

export const closeHUD: express.RequestHandler = async (req, res) => {
	const response = await HUDWindow.close();
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

export const sendActionByHTTP: express.RequestHandler = async (req, res) => {
	const io = await ioPromise;
	let { hudDir } = req.params;
	const { action } = req.params;

	const data = req.body;

	if (hudDir === 'development' && 'isDev' in req.query && HUDState.devHUD?.dir) {
		hudDir = HUDState.devHUD.dir;
	}

	if (data) {
		io.to(hudDir).emit('hud_action', { data, action });
	} else {
		io.to(hudDir).emit('keybindAction', action);
	}
	return res.sendStatus(200);
};

export const removeArchives = () => {
	const files = fs
		.readdirSync('./')
		.filter(file => (file.startsWith('hud_temp_') || file.startsWith('ar_temp_')) && file.endsWith('.zip'));
	files.forEach(file => {
		try {
			if (fs.lstatSync(file).isDirectory()) {
				return;
			}
			if (fs.existsSync(file)) fs.unlinkSync(file);
		} catch {}
	});
};

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

			if (!fileString) {
				throw new Error();
			}

			const tempArchiveName = `./hud_temp_archive_${getRandomString()}.zip`;
			fs.writeFileSync(tempArchiveName, fileString, { encoding: 'base64', mode: 777 });

			const tempUnzipper: any = new DecompressZip(tempArchiveName);
			tempUnzipper.on('extract', async () => {
				if (fs.existsSync(path.join(hudPath, 'hud.json'))) {
					const hudData = await getHUDData(path.basename(hudPath));
					if (!hudData || !hudData.name) {
						throw new Error();
					}
					removeArchives();

					fs.writeFileSync(path.join(hudPath, 'uuid.lhm'), existingUUID || uuidv4(), 'utf8');
					res(hudData);
				} else {
					if (fs.existsSync(hudPath)) {
						remove(hudPath);
					}
					removeArchives();
					res(null);
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
	data: OnlineHUDEntry | null;
};

// const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export const downloadHUD: RequestHandler = async (req, res) => {
	const uuid = req.params.uuid;
	if (!customer.game || !uuid) return res.sendStatus(422);

	let fileUrl = `storage/file/${customer.game}/hud/${uuid}`;

	if (customer.customer && customer.workspace) {
		fileUrl += `?&teamId=${customer.workspace.id}`;
	}

	const hudData = ((await api(fileUrl)) || null) as APIFileResponse | null;

	const name = hudData?.data?.extra?.name;

	if (!name) {
		return res.sendStatus(404);
	}

	let presignedUrl = `storage/file/url/${customer.game}/GET/${uuid}`;

	if (customer.customer && customer.workspace) {
		presignedUrl += `?&teamId=${customer.workspace.id}`;
	}

	const presignedURLResponse = (await api(presignedUrl)) as { url: string };

	if (!presignedURLResponse || !presignedURLResponse.url) {
		return res.sendStatus(404);
	}

	const response = await fetch(presignedURLResponse.url);

	if (!response.ok) {
		return res.sendStatus(404);
	}

	const buffer = await response.buffer();

	const hudBufferString = buffer.toString('base64');

	const result = await loadHUD(hudBufferString, name, uuid);

	return res.json({ result });
};

export const deleteHUDFromCloud: RequestHandler = async (req, res) => {
	const uuid = req.params.uuid;
	if (!customer.game || !uuid) return res.sendStatus(422);

	const io = await ioPromise;

	let url = `storage/file/${customer.game}/hud/${uuid}`;

	if (customer.customer && customer.workspace) {
		url += `?&teamId=${customer.workspace.id}`;
	}

	const response = (await api(url, 'DELETE')) as { success: boolean };

	if (response.success) {
		io.emit('reloadHUDs');
	}

	return res.json(response);
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

	if (!hud || !hud.uuid || hud.game === 'all') return res.sendStatus(422);

	let presignedUrl = `storage/file/url/${customer.game}/PUT/${hud.uuid}`;

	if (customer.customer && customer.workspace) {
		presignedUrl += `?&teamId=${customer.workspace.id}`;
	}

	const presignedURLResponse = (await api(presignedUrl)) as { url: string };

	if (!presignedURLResponse || !presignedURLResponse.url) {
		return res.sendStatus(404);
	}

	let uploadUrl = `storage/file/${customer.game}/hud/${hud.uuid}`;

	if (customer.customer && customer.workspace) {
		uploadUrl += `?&teamId=${customer.workspace.id}`;
	}

	const hudUploadResponse = await api(uploadUrl, 'POST', {
		extra: hud
	});
	if (!hudUploadResponse || !hudUploadResponse.result) {
		return res.sendStatus(404);
	}

	const archivePath = await archiveHUD(hudDir);

	const payload = fs.createReadStream(archivePath);
	const response = await fetch(presignedURLResponse.url, {
		method: 'PUT',
		body: payload,
		headers: {
			'Content-Length': `${fs.statSync(archivePath).size}`
		}
	});
	if (!response.ok) {
		fs.unlinkSync(archivePath);

		return res.sendStatus(404);
	}

	fs.unlinkSync(archivePath);

	return res.json({ hudUploadResponse });
};

const getAllFilesToSign = (hudDir: string) => {
	const files: string[] = [];
	const getFiles = (dir: string) => {
		fs.readdirSync(dir).forEach(file => {
			const fileDirectory = path.join(dir, file);
			if (fs.statSync(fileDirectory).isDirectory()) return getFiles(fileDirectory);
			else if (fileDirectory.endsWith('.js')) return files.push(fileDirectory);
		});
	};
	getFiles(hudDir);
	return files;
};

export const signHUD = async (hudDir: string) => {
	const dir = path.join(app.getPath('home'), 'HUDs', hudDir);

	const keyFile = path.join(dir, 'key');

	if (fs.existsSync(keyFile)) {
		return true;
	}

	const filesToSign = getAllFilesToSign(dir);

	filesToSign.push(path.join(dir, 'hud.json'));

	const keys = crypto.generateKeyPairSync('rsa', {
		modulusLength: 4096,
		publicKeyEncoding: {
			type: 'spki',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs8',
			format: 'pem',
			cipher: 'aes-256-cbc',
			passphrase: 'top secret'
		}
	});

	let success = true;

	const fileToContent: any = {};

	filesToSign.forEach(file => {
		if (!success) {
			return;
		}
		const content = fs.readFileSync(file, 'utf8');
		try {
			const signed = jwt.sign(
				content,
				{ key: keys.privateKey.toString(), passphrase: 'top secret' },
				{ algorithm: 'RS256' }
			);
			fileToContent[file] = signed;
		} catch {
			success = false;
		}
	});

	if (!success) return false;

	filesToSign.forEach(file => {
		fs.writeFileSync(file, fileToContent[file]);
	});

	fs.writeFileSync(keyFile, keys.publicKey.toString());

	return success;
};

export const singHUDByDir: RequestHandler = async (_req, res) => {
	/*const hudDir = req.params.hudDir;
	const result = await signHUD(hudDir);
	return res.json({ result });*/
	return res.sendStatus(200);
};

listHUDs().then(huds => huds.filter(hud => !!hud.dir).map(hud => verifyUniqueID(hud.dir)));
