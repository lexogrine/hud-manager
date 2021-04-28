import db from './../../../init/database';
import { MapConfig } from '../../../types/interfaces';
import areas from '../../aco/areas';

const { aco } = db;

export async function getACOByMapName(mapName: string): Promise<MapConfig | null> {
	return new Promise(res => {
		aco.findOne({ map: mapName }, (err, acoConfig) => {
			if (err) {
				return res(null);
			}

			return res(acoConfig);
		});
	});
}

export const getACOs = () =>
	new Promise<MapConfig[]>(res => {
		aco.find({}, (err: Error, acoConfigs: MapConfig[]) => {
			if (err) {
				return res([]);
			}
			return res(acoConfigs);
		});
	});

export const updateACO = (config: MapConfig) =>
	new Promise<MapConfig | null>(res => {
		getACOByMapName(config.map).then(oldConfig => {
			if (!oldConfig) {
				aco.insert(config, (err, newConfig) => {
					if (err) {
						return res(null);
					}
					return res(newConfig);
				});
			} else {
				aco.update({ map: config.map }, config, {}, (err, n) => {
					if (err) {
						return res(null);
					}
					getACOs().then(acos => {
						areas.areas = acos;
					});
					return res(config);
				});
			}
		});
	});
/*
export const replaceLocalTeams = (newTeams: Team[], game: AvailableGames, existing: string[]) =>
	new Promise<boolean>(res => {
		const or: any[] = [
			{ game, _id: { $nin: existing } },
			{ game, _id: { $in: newTeams.map(team => team._id) } }
		];
		if (game === 'csgo') {
			or.push(
				{ game: { $exists: false }, _id: { $nin: existing } },
				{ game: { $exists: false }, _id: { $in: newTeams.map(team => team._id) } }
			);
		}
		teams.remove({ $or: or }, { multi: true }, err => {
			if (err) {
				return res(false);
			}
			teams.insert(newTeams, (err, docs) => {
				return res(!err);
			});
		});
	});
*/
