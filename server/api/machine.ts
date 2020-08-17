import fs from 'fs';
import express from 'express';
import { app } from 'electron';
import path from 'path';

export const getMachineId: express.RequestHandler = async (req, res) => {
	const machinePath = path.join(app.getPath('userData'), 'machine.hm');
	let id = (Math.random() * 1000 + 1)
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substr(0, 15);
	if (!fs.existsSync(machinePath)) {
		fs.writeFileSync(machinePath, id, 'UTF-8');
	} else {
		id = fs.readFileSync(machinePath, 'UTF-8');
	}

	return res.json({ id });
};
