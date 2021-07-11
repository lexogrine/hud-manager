import express from 'express';
import path from 'path';
import { app } from 'electron';
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
