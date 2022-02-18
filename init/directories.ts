import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
const DecompressZip = require('decompress-zip');

export const LHMP = {
	CSGO: '1.1.0'
}

function createIfMissing(directory: string) {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory);
	}
}
const getRandomString = () =>
	(Math.random() * 1000 + 1)
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substr(0, 15);

const removeArchives = () => {
	const files = fs
		.readdirSync('./')
		.filter(file => (file.startsWith('hud_temp_') || file.startsWith('ar_temp_')) && file.endsWith('.zip'));

	files.forEach(file => {
		try {
			if (fs.lstatSync(file).isDirectory()) {
				return;
			}
			if (fs.existsSync(file)) fs.unlinkSync(file);
		} catch {}
	});
};

const remove = (pathToRemove: string, leaveRoot = false) => {
	if (!fs.existsSync(pathToRemove)) {
		return;
	}
	const files = fs.readdirSync(pathToRemove);
	files.forEach(function (file) {
		const current = path.join(pathToRemove, file);
		if (fs.lstatSync(current).isDirectory()) {
			// recurse
			remove(current);
			if (fs.existsSync(current)) fs.rmdirSync(current);
		} else {
			// delete file
			if (fs.existsSync(current)) fs.unlinkSync(current);
		}
	});
	if(!leaveRoot) fs.rmdirSync(pathToRemove);
};
export async function loadHUDPremium(): Promise<any> {
	removeArchives();
	return new Promise(res => {
		const hudPath = path.join(app.getPath('userData'), 'premium', 'csgo');
		if (!fs.existsSync(hudPath)) {
			return res(null);
		}
		
		const versionFile = path.join(hudPath, 'version');

		const doVersionFileExist = fs.existsSync(versionFile);

		let shouldUpdate = false;

		if(!doVersionFileExist){
			shouldUpdate = true;
		} else {
			const content = fs.readFileSync(versionFile, 'utf-8');
			if(LHMP.CSGO !== content){
				shouldUpdate = true;
			}
		}

		if(!shouldUpdate){
			return res(null);
		}
		remove(hudPath, true);
		fs.writeFileSync(versionFile, LHMP.CSGO);
		try {
			const fileString = fs.readFileSync(path.join(__dirname, './lhmp.zip'), 'base64');

			if (!fileString) {
				res(null);
				throw new Error();
			}

			const tempArchiveName = `./hud_temp_archive_${getRandomString()}.zip`;
			fs.writeFileSync(tempArchiveName, fileString, { encoding: 'base64', mode: 777 });

			const tempUnzipper: any = new DecompressZip(tempArchiveName);
			tempUnzipper.on('extract', async () => {
				removeArchives();
				res(null);
			});
			tempUnzipper.on('error', () => {
				if (fs.existsSync(hudPath)) {
					remove(hudPath);
				}
				removeArchives();
				res(null);
			});
			tempUnzipper.extract({
				path: hudPath
			});
			/**/
		} catch (e) {
			console.log(e);
			if (fs.existsSync(hudPath)) {
				remove(hudPath);
			}
			removeArchives();
			res(null);
		}
	});
}
export function checkDirectories() {
	const hudsData = path.join(app.getPath('home'), 'HUDs');
	const userData = app.getPath('userData');
	const userDataPr = path.join(app.getPath('userData'), 'premium');
	const userDataPrCSGO = path.join(app.getPath('userData'), 'premium', 'csgo');
	const database = path.join(userData, 'databases');
	const arData = path.join(userData, 'ARs');
	const errors = path.join(userData, 'errors');

	const userDatabases = path.join(database, 'users');
	const teamDatabases = path.join(database, 'workspaces');

	[hudsData, userData, database, arData, errors, userDatabases, teamDatabases, userDataPr, userDataPrCSGO].forEach(
		createIfMissing
	);
	const mapFile = path.join(app.getPath('userData'), 'maps.json');

	if (!fs.existsSync(mapFile)) {
		const maps = [
			'de_mirage',
			'de_dust2',
			'de_inferno',
			'de_nuke',
			'de_train',
			'de_overpass',
			'de_vertigo',
			'de_cache',
			'de_ancient'
		];
		fs.writeFileSync(mapFile, JSON.stringify(maps));
	}
}
