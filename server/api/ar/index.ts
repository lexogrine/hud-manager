import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import * as I from './../../../types/interfaces';
import { customer } from '..';

export const getARKeyBinds = (dirName: string) => {
	const dir = path.join(app.getPath('userData'), 'ARs', dirName);
	const keybindsFileDir = path.join(dir, 'keybinds.json');
	if (!fs.existsSync(keybindsFileDir)) {
		return [];
	}
	try {
		const keybindsFile = fs.readFileSync(keybindsFileDir, { encoding: 'utf8' });
		const keybinds = JSON.parse(keybindsFile) as I.KeyBind[];
		return keybinds;
	} catch (e) {
		return [];
	}
};


export const getARPanelSetting = (dirName: string) => {
	const dir = path.join(app.getPath('userData'), 'ARs', dirName);
	const panelFileDir = path.join(dir, 'panel.json');
	if (!fs.existsSync(panelFileDir)) {
		return undefined;
	}
	try {
		const panelFile = fs.readFileSync(panelFileDir, { encoding: 'utf8' });
		const panel = JSON.parse(panelFile) as I.PanelTemplate;
		return panel;
	} catch (e) {
		return undefined;
	}
};

export const getARModuleData = (directory: string) => {
    const dir = path.join(app.getPath('userData'), 'ARs', directory);
	const configFileDir = path.join(dir, 'ar.json');

	try {
		const configFile = fs.readFileSync(configFileDir, { encoding: 'utf8' });
		const config = JSON.parse(configFile) as I.ARModule;
		config.dir = directory;
        config.keybinds = getARKeyBinds(directory);
        config.panel = getARPanelSetting(directory);
		return config;
	} catch (e) {
		return null;
	}
}

const filterValidARModules = (ar: I.ARModule | null) => {
    if(!ar || !ar.game || !ar.entry || !ar.name || !ar.dir || ar.game !== customer.game) return false;
	const entryPath = path.join(app.getPath('userData'), 'ARs', ar.dir, ar.entry);
    return fs.existsSync(entryPath);
}


export const listARModules = () => {
    if(!customer.game) return [];
	const dir = path.join(app.getPath('userData'), 'ARs');
	const filtered = fs
		.readdirSync(dir, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.filter(dirent => /^[0-9a-zA-Z-_]+$/g.test(dirent.name))
        .map(dirent => dirent.name);
    
    const arModules = filtered.map(directory => getARModuleData(directory)).filter(filterValidARModules);

    return arModules;
}