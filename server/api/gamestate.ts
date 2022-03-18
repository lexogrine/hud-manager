import fs from 'fs';
import path from 'path';
import * as VDF from '@node-steam/vdf';
import { getGamePath } from 'steam-game-path';
import express from 'express';
import { loadConfig } from './config';
import { dialog } from 'electron';
import generateGSI, { GSI } from 'csgogsi-generator';

const GSITemplateCSGO = generateGSI('HUDMANAGERGSI', 'http://localhost:1349/').json;
export const GSITemplateDota2 = {
	HUDMANAGERGSI: {
		uri: 'http://localhost:1349/dota2',
		timeout: 5.0,
		buffer: 0.1,
		throttle: 0.1,
		heartbeat: 0.1,
		data: {
			buildings: 1,
			provider: 1,
			map: 1,
			player: 1,
			hero: 1,
			abilities: 1,
			items: 1,
			draft: 1,
			wearables: 1
		}
	}
};

export const checkGSIFile: express.RequestHandler = async (req, res) => {
	const game = req.query.game as 'dota2' | 'csgo';

	const steamGameId = game === 'csgo' ? 730 : 570;

	const config = await loadConfig();
	let GamePath;
	try {
		GamePath = getGamePath(steamGameId);
	} catch {
		return res.json({ success: false, message: "Game path couldn't be found", accessible: false });
	}
	if (!config || !GamePath || !GamePath.game || !GamePath.game.path) {
		return res.json({ success: false, message: "Game path couldn't be found", accessible: false });
	}

	const pathToFile =
		game === 'csgo'
			? path.join(GamePath.game.path, 'csgo', 'cfg')
			: path.join(GamePath.game.path, 'game', 'dota', 'cfg', 'gamestate_integration');

	const cfgPath = path.join(pathToFile, 'gamestate_integration_hudmanager.cfg');
	if (!fs.existsSync(cfgPath)) {
		return res.json({ success: false, message: "File couldn't be found", accessible: true });
	}
	try {
		const rawContent = fs.readFileSync(cfgPath, 'utf-8');
		const content = VDF.parse(rawContent)?.HUDMANAGERGSI as GSI;
		if (!content) {
			//Corrupted file
			return res.json({ success: false, message: 'File seems to be corrupted', accessible: true });
		}
		if (!content.uri.includes(`:${config.port}/`)) {
			// wrong port
			return res.json({ success: false, message: 'Wrong address', accessible: true });
		}
		if (game === 'csgo') {
			if (JSON.stringify(GSITemplateCSGO.HUDMANAGERGSI.data) !== JSON.stringify(content.data)) {
				// wrong settings, csgo
				return res.json({ success: false, message: 'Wrong configuration', accessible: true });
			}
		} else {
			if (JSON.stringify(GSITemplateDota2.HUDMANAGERGSI.data) !== JSON.stringify(content.data)) {
				// wrong settings, dota2
				return res.json({ success: false, message: 'Wrong configuration', accessible: true });
			}
		}
		if (!content.auth && config.token) {
			return res.json({ success: false, message: 'Wrong token', accessible: true });
		}
		if (content.auth && content.auth.token !== config.token) {
			return res.json({ success: false, message: 'Wrong token', accessible: true });
		}
		return res.json({ success: true });
	} catch {
		return res.json({ success: false, message: 'Unexpected error occured', accessible: true });
	}
};

export const generateGSIFile = async (game: any) => {
	if (!game) return '';
	const config = await loadConfig();

	let address = `http://localhost:${config.port}/`;

	if (game === 'dota2') {
		address += 'dota2';
		const gsi = JSON.parse(JSON.stringify(GSITemplateDota2));
		gsi.HUDMANAGERGSI.uri = address;

		return VDF.stringify(gsi);
	}

	const text = generateGSI('HUDMANAGERGSI', address, config.token).vdf;
	return text;
};

export const createGSIFile: express.RequestHandler = async (req, res) => {
	const game = req.query.game as 'dota2' | 'csgo';

	const steamGameId = game === 'csgo' ? 730 : 570;

	const text = await generateGSIFile(game);
	if (!text) {
		return res.sendStatus(422);
	}

	let GamePath;
	try {
		GamePath = getGamePath(steamGameId);
	} catch {
		return res.json({});
	}
	if (!GamePath || !GamePath.game || !GamePath.game.path) {
		return res.json({});
	}

	const pathToFile =
		game === 'csgo'
			? path.join(GamePath.game.path, 'csgo', 'cfg')
			: path.join(GamePath.game.path, 'game', 'dota', 'cfg', 'gamestate_integration');

	const cfgPath = path.join(pathToFile, 'gamestate_integration_hudmanager.cfg');

	try {
		if (game === 'dota2') {
			if (!fs.existsSync(pathToFile)) {
				fs.mkdirSync(pathToFile);
			}
		}
		if (fs.existsSync(cfgPath)) {
			fs.unlinkSync(cfgPath);
		}
		fs.writeFileSync(cfgPath, text, 'utf-8');
		return res.json({ success: true, message: 'Config file was successfully saved' });
	} catch {
		return res.json({ success: false, message: 'Unexpected error occured' });
	}
};

type SaveableFile = string | Buffer;

export const saveFile =
	(
		name: string,
		content: SaveableFile | Promise<SaveableFile> | (() => Promise<SaveableFile>),
		base64 = false,
		writeFile?: (path: string) => void
	): express.RequestHandler =>
	async (_req, res) => {
		res.sendStatus(200);
		const result = await dialog.showSaveDialog({ defaultPath: name });
		if(result.filePath && writeFile){
			writeFile(result.filePath);
			return;
		}
		let text: string | Buffer = '';

		if (typeof content === 'string') {
			text = content;
		} else if (typeof content === 'function') {
			text = await content();
		} else {
			text = await content;
		}

		const isString = typeof text === 'string';

		if (result.filePath) {
			fs.writeFileSync(result.filePath, text, isString ? { encoding: base64 ? 'base64' : 'utf-8' } : null);
		}
	};

export const cfgsZIPBase64 =
	'UEsDBBQAAAAIAJOYXE84wXDJWAAAAHQAAAAWAAAAaHVkX3JhZGFyX2tpbGxmZWVkLmNmZ1XKQQqAIBAAwHuvEO8h4iHoM4uoZbC5sa5Jv48giM4zASGy70AFL4jJSy4kW0hV2eG13CIsxCH9fbTDvvEJx4qqMSrd62wMUvCYqcrsrHOTeYr+YhXPcgNQSwMEFAAAAAgAk5hcTyCrGb0xAAAANAAAAAcAAABodWQuY2ZnS86JTylKLI/Pz8upjE9JTSzJyMsvyUxOLVYw5ILKZZSmxKflFyWnxhclpiQWKRgCAFBLAwQUAAAACACTmFxPoMM5S18AAACNAAAAEAAAAGh1ZF9raWxsZmVlZC5jZmdtyzEKgDAMQNHdUxR3KaWD0MuE0FYrRCNpVLy9CIIIzv/9SJAED+CFTkgZtSysU8zVuOZpZUswsMQMggnlL3zGzjXzJDusI5lNyLRHDdYSR6TCVYN33vf2Ju0Lq6LoBVBLAwQUAAAACACTmFxPJlBm3h0AAAAbAAAADQAAAGh1ZF9yYWRhci5jZmdLzolPKUosj8/Py6mMT0lNLMnIyy/JTE4tVjAEAFBLAQIfABQAAAAIAJOYXE84wXDJWAAAAHQAAAAWACQAAAAAAAAAIAAAAAAAAABodWRfcmFkYXJfa2lsbGZlZWQuY2ZnCgAgAAAAAAABABgA9RNKKrqN1QFdZynbBcfVAUpAKdsFx9UBUEsBAh8AFAAAAAgAk5hcTyCrGb0xAAAANAAAAAcAJAAAAAAAAAAgAAAAjAAAAGh1ZC5jZmcKACAAAAAAAAEAGACvXUwquo3VAYS1KdsFx9UBhLUp2wXH1QFQSwECHwAUAAAACACTmFxPoMM5S18AAACNAAAAEAAkAAAAAAAAACAAAADiAAAAaHVkX2tpbGxmZWVkLmNmZwoAIAAAAAAAAQAYAFpzSyq6jdUBfisq2wXH1QGtAyrbBcfVAVBLAQIfABQAAAAIAJOYXE8mUGbeHQAAABsAAAANACQAAAAAAAAAIAAAAG8BAABodWRfcmFkYXIuY2ZnCgAgAAAAAAABABgALddKKrqN1QHxnyrbBcfVAeR4KtsFx9UBUEsFBgAAAAAEAAQAggEAALcBAAAAAA==';
