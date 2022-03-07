import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { availableGames, AvailableGames } from '../types/interfaces';
const DecompressZip = require('decompress-zip');

const temporaryFilesArchive = path.join(app.getPath('userData'), 'archives');

export const LHMP: Record<AvailableGames, string | null> = {
	csgo: '1.2.1',
	rocketleague: '1.1.1',
	dota2: null,
	f1: null
};

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
		.readdirSync(temporaryFilesArchive)
		.filter(file => (file.startsWith('hud_temp_') || file.startsWith('ar_temp_')) && file.endsWith('.zip'));

	files.forEach(file => {
		try {
			if (fs.lstatSync(path.join(temporaryFilesArchive, file)).isDirectory()) {
				return;
			}
			if (fs.existsSync(path.join(temporaryFilesArchive, file)))
				fs.unlinkSync(path.join(temporaryFilesArchive, file));
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
	if (!leaveRoot) fs.rmdirSync(pathToRemove);
};

export const loadAllPremiumHUDs = () => {
	return Promise.all([
		loadHUDPremium('csgo', 'csgo'),
		loadHUDPremium('rocketleague', 'rocketleague1'),
		loadHUDPremium('rocketleague', 'rocketleague2')
	]);
};

export async function loadHUDPremium(game: AvailableGames, dir: string): Promise<any> {
	removeArchives();
	return new Promise(res => {
		const hudPath = path.join(app.getPath('userData'), 'premium', dir);
		const hudVersion = LHMP[game];
		if (!fs.existsSync(hudPath) || !hudVersion) {
			return res(null);
		}

		const versionFile = path.join(hudPath, 'version');

		const doVersionFileExist = fs.existsSync(versionFile);

		let shouldUpdate = false;

		if (!doVersionFileExist) {
			shouldUpdate = true;
		} else {
			const content = fs.readFileSync(versionFile, 'utf-8');
			if (hudVersion && hudVersion !== content) {
				shouldUpdate = true;
			}
		}

		if (!shouldUpdate) {
			return res(null);
		}
		remove(hudPath, true);
		fs.writeFileSync(versionFile, hudVersion);

		let archiveFilename = './lhmp';

		if (game !== 'csgo') {
			archiveFilename += dir;
		}

		archiveFilename += '.zip';

		try {
			/*const fileBuffer = fs.readFileSync(path.join(__dirname, archiveFilename));

			if (!fileBuffer) {
				res(null);
				throw new Error();
			}

			const tempArchiveName = `./hud_temp_archive_${getRandomString()}.zip`;
			const archiveFilepath = path.join(temporaryFilesArchive, tempArchiveName);
			//const tempArchivePath = path.join(app.getPath('userData'), tempArchiveName);
			fs.writeFileSync(archiveFilepath, fileBuffer, { mode: 777 });*/

			const tempUnzipper: any = new DecompressZip(path.join(__dirname, archiveFilename));
			tempUnzipper.on('extract', async () => {
				removeArchives();
				res(null);
			});
			tempUnzipper.on('error', (err: any) => {
				console.log(err);
				if (fs.existsSync(hudPath)) {
					remove(hudPath, true);
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
				remove(hudPath, true);
			}
			removeArchives();
			res(null);
		}
	});
}
export function checkDirectories() {
	const hudsData = path.join(app.getPath('home'), 'HUDs');
	const userData = app.getPath('userData');
	const premiumHUDsDirectory = path.join(app.getPath('userData'), 'premium');

	const premiumHUDsGames = ['csgo/', 'rocketleague1/', 'rocketleague2/'].map(dir =>
		path.join(premiumHUDsDirectory, dir)
	);

	const database = path.join(userData, 'databases');
	const arData = path.join(userData, 'ARs');
	const errors = path.join(userData, 'errors');

	const userDatabases = path.join(database, 'users');
	const teamDatabases = path.join(database, 'workspaces');

	[
		hudsData,
		userData,
		database,
		arData,
		errors,
		temporaryFilesArchive,
		userDatabases,
		teamDatabases,
		premiumHUDsDirectory,
		...premiumHUDsGames
	].forEach(createIfMissing);
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
