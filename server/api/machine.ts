import fs from 'fs';
import express from 'express';
import { app } from 'electron';
import path from 'path';

export const getMachineId: express.RequestHandler = async (req, res) => {
	const machinePathDirectory = path.join(app.getPath('appData'), '.lexogrine');

	const machinePath = path.join(machinePathDirectory, 'machine.hm');

	const machineOldPath = path.join(app.getPath('userData'), 'machine.hm');

	if (!fs.existsSync(machinePathDirectory)) {
		fs.mkdirSync(machinePathDirectory, { recursive: true });
	}

	let id = (Math.random() * 1000 + 1)
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substr(0, 15);

	if (fs.existsSync(machinePath)) {
		id = fs.readFileSync(machinePath, 'UTF-8');
		return res.json({ id });
	}

	if (fs.existsSync(machineOldPath)) {
		id = fs.readFileSync(machineOldPath, 'UTF-8');
		fs.renameSync(machineOldPath, machinePath);
		return res.json({ id });
	}
	fs.writeFileSync(machinePath, id, { encoding: 'UTF-8' });
	return res.json({ id });
};
