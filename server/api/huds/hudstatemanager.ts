import path from 'path';
import { app as Application } from 'electron';
import fs from 'fs';
import * as I from '../../../types/interfaces';
import { getTeamById } from '../teams';
import { getPlayerById } from '../players';
import {getMatchById } from '../matches';

export class HUDStateManager {
	data: Map<string, any>;
	devHUD: I.HUD | null;
	constructor() {
		this.data = new Map();
		this.devHUD = null;
	}
	async save(hud: string, data: object) {
		const hudPath = path.join(Application.getPath('home'), 'HUDs', hud);
		if (!fs.existsSync(hudPath)) return;
		fs.writeFileSync(path.join(hudPath, 'config.hm'), JSON.stringify(data));
	}
	set(hud: string, section: string, data: any) {
		const form = this.get(hud);
		const newForm = { ...form, [section]: data };
		this.save(hud, newForm);
		this.data.set(hud, newForm);
	}
	get(hud: string, force = false) {
		const hudData = this.data.get(hud);
		const hudPath = path.join(Application.getPath('home'), 'HUDs', hud);
		const hudConfig = path.join(hudPath, 'config.hm');

		if (hudData || !force || !fs.existsSync(hudPath) || !fs.existsSync(hudConfig)) return hudData;
		const rawData = fs.readFileSync(hudConfig, 'utf8');
		try {
			const data = JSON.parse(rawData);
			return this.data.set(hud, data).get(hud);
		} catch {
			return undefined;
		}
	}

	static extend = async (hudData: any) => {
		if (!hudData || typeof hudData !== 'object') return hudData;
		for (const data of Object.values(hudData) as any[]) {
			if (!data || typeof data !== 'object') return hudData;
			const entries: any[] = Object.values(data);
			for (const entry of entries) {
				if (!entry || typeof entry !== 'object') continue;

				if (!('type' in entry) || !('id' in entry)) continue;
				let extraData;
				switch (entry.type) {
					case 'match':
						extraData = await getMatchById(entry.id);
						break;
					case 'player':
						extraData = await getPlayerById(entry.id);
						break;
					case 'team':
						extraData = await getTeamById(entry.id);
						break;
					default:
						continue;
				}
				entry[entry.type] = extraData;
			}
		}
		return hudData;
	};
}