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
	const arData = path.join(userData, 'ARs');

	[hudsData, userData, database, arData].forEach(createIfMissing);
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
