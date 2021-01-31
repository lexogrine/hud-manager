import fs from 'fs';
import express from 'express';
import { app } from 'electron';
import path from 'path';

export const getMachineId = () => {
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
		return id;
	}

	if (fs.existsSync(machineOldPath)) {
		id = fs.readFileSync(machineOldPath, 'UTF-8');
		fs.renameSync(machineOldPath, machinePath);
		return id;
	}
	fs.writeFileSync(machinePath, id, { encoding: 'UTF-8' });
	return id;
};

export const getMachineIdRoute: express.RequestHandler = async (req, res) => {
	return res.json({ id: getMachineId() });
};
