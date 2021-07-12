import express from 'express';
import path from 'path';
import { app, shell, Notification } from 'electron';
import * as AR from './index';

export const getARModules: express.RequestHandler = (req, res) => {
	const ars = AR.listARModules();

	return res.json(ars);
};

export const getARModulesAssets: express.RequestHandler = async (req, res, next) => {
	if (!req.params.dir) {
		return res.sendStatus(404);
	}
	const data = await AR.getARModuleData(req.params.dir);
	if (!data) {
		return res.sendStatus(404);
	}
	return express.static(path.join(app.getPath('userData'), 'ARs', req.params.dir))(req, res, next);
};


export const openARsDirectory: express.RequestHandler = async (_req, res) => {
	const dir = path.join(app.getPath('userData'), 'ARs');
	shell.openPath(dir);
	return res.sendStatus(200);
};


export const sendAR: express.RequestHandler = async (req, res) => {
	if (!req.body.ar || !req.body.name) return res.sendStatus(422);
	const response = await AR.loadAR(req.body.ar, req.body.name);
	if (response) {
		const notification = new Notification({
			title: 'AR Upload',
			body: `${response.name} uploaded successfully`,
			icon: path.join(__dirname, '../../../assets/icon.png')
		});
		notification.show();
	}
	return res.sendStatus(response ? 200 : 500);
};