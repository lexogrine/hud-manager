import fs from 'fs';
import express from 'express';
import { app } from 'electron';
import path from 'path';
import { LastLaunchedVersion } from '../../types/interfaces';



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

export const getLastLaunchedVersion: express.RequestHandler = async (req, res) => {
	const releasePathDirectory = path.join(app.getPath('appData'), '.lexogrine');

	const releasePath = path.join(releasePathDirectory, 'release.hm');

	if(!fs.existsSync(releasePath)){
		return res.json({ version: '2.0', releaseDate: "2021-07-24T03:12:24Z" });
	}

	try {
		const lastRelease = JSON.parse(fs.readFileSync(releasePath, 'utf8')) as LastLaunchedVersion;

		return res.json(lastRelease);
	} catch {
		return res.json({ version: '2.0', releaseDate: "2021-07-24T03:12:24Z" });
	}
}

export const saveLastLaunchedVersion: express.RequestHandler = async (req, res) => {
	const releasePathDirectory = path.join(app.getPath('appData'), '.lexogrine');

	const releasePath = path.join(releasePathDirectory, 'release.hm');

	const { version, releaseDate } = req.body;

	fs.writeFileSync(releasePath, JSON.stringify({ version, releaseDate }),'utf8');

	return res.sendStatus(200);
}
