import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

function createIfMissing(directory: string) {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory);
	}
}

export function checkDirectories() {
	const hudsData = path.join(app.getPath('home'), 'HUDs');
	const userData = app.getPath('userData');
	const database = path.join(userData, 'databases');

	[hudsData, userData, database].forEach(createIfMissing);
	const cookieFile = path.join(database, 'cookie');
	const mapFile = path.join(app.getPath('userData'), 'maps.json');
	if (!fs.existsSync(cookieFile)) {
		fs.writeFileSync(cookieFile, '[]', 'utf8');
	}
	if (!fs.existsSync(mapFile)) {
		const maps = ['de_mirage', 'de_dust2', 'de_inferno', 'de_nuke', 'de_train', 'de_overpass', 'de_vertigo'];
		fs.writeFileSync(mapFile, JSON.stringify(maps));
	}
}
