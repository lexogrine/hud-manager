import express from 'express';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

const getAmountOfBytesOfDatabases = () => {
	const directory = path.join(app.getPath('userData'), 'databases');
	const files = ['players', 'teams', 'matches', 'tournaments', 'custom', 'aco'];

	let bytes = 0;

	for(const file of files){
		bytes += fs.statSync(path.join(directory, file)).size;
	}

	return bytes;
}

export const getCloudSize: express.RequestHandler = async (req, res) => {
	return res.json({ size: getAmountOfBytesOfDatabases() });
};
