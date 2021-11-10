import express from 'express';
//import path from 'path';
//import fs from 'fs';
//import { app } from 'electron';
import databases from '../../../init/database';

export const getAmountOfBytesOfDatabases = () => {
	const size = Object.values(databases)
		.map(db => Buffer.byteLength(JSON.stringify(db.getAllData()), 'utf8'))
		.reduce((a, b) => a + b, 0);

	//const directory = path.join(app.getPath('userData'), 'databases');
	//const files = ['players', 'teams', 'matches', 'tournaments', 'custom', 'aco'];

	/*let bytes = 0;

	for (const file of files) {
		bytes += fs.statSync(path.join(directory, file)).size;
	}*/

	return size;
};

export const getCloudSize: express.RequestHandler = async (req, res) => {
	return res.json({ size: getAmountOfBytesOfDatabases() });
};
