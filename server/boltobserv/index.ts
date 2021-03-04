import express from 'express';
import path from 'path';
import fs from 'fs';
import { app as Application } from 'electron';
import { app } from '..';
import { getHUDData } from '../api/huds';

const customRadarCSS: express.RequestHandler = async (req, res) => {
	const sendDefault = () => res.sendFile(path.join(__dirname, '../boltobserv', 'css', `custom.css`));
	if (!req.query.hud || typeof req.query.hud !== 'string') {
		return sendDefault();
	}
	const hud = await getHUDData(req.query.hud);

	if (!hud?.boltobserv?.css) return sendDefault();

	const dir = path.join(Application.getPath('home'), 'HUDs', req.query.hud);
	return res.sendFile(path.join(dir, 'radar.css'));
};

app.get('/boltobserv/css/custom.css', customRadarCSS);

app.get('/huds/:hud/custom.css', (req, res, next) => {
	req.query.hud = req.params.hud;
	return customRadarCSS(req, res, next);
});

app.get('/boltobserv/maps/:mapName/meta.json5', async (req, res) => {
	const sendDefault = () =>
		res.sendFile(path.join(__dirname, '../boltobserv', 'maps', req.params.mapName, 'meta.json5'));

	if (!req.params.mapName) {
		return res.sendStatus(404);
	}
	if (req.query.dev === 'true') {
		try {
			const result = await fetch(`http://localhost:3500/maps/${req.params.mapName}/meta.json5`, {});
			return res.send(await result.text());
		} catch {
			return sendDefault();
		}
	}
	if (!req.query.hud || typeof req.query.hud !== 'string') return sendDefault();

	const hud = await getHUDData(req.query.hud);
	if (!hud?.boltobserv?.maps) return sendDefault();

	const dir = path.join(Application.getPath('home'), 'HUDs', req.query.hud);
	const pathFile = path.join(dir, 'maps', req.params.mapName, 'meta.json5');
	if (!fs.existsSync(pathFile)) return sendDefault();
	return res.sendFile(pathFile);
});

app.get('/boltobserv/maps/:mapName/radar.png', async (req, res) => {
	const sendDefault = () =>
		res.sendFile(path.join(__dirname, '../boltobserv', 'maps', req.params.mapName, 'radar.png'));

	if (!req.params.mapName) {
		return res.sendStatus(404);
	}
	if (!req.query.hud || typeof req.query.hud !== 'string') return sendDefault();

	const hud = await getHUDData(req.query.hud);
	if (!hud?.boltobserv?.maps) return sendDefault();

	const dir = path.join(Application.getPath('home'), 'HUDs', req.query.hud);
	const pathFile = path.join(dir, 'maps', req.params.mapName, 'radar.png');
	if (!fs.existsSync(pathFile)) return sendDefault();
	return res.sendFile(pathFile);
});
