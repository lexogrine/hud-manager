import db from './../../../init/database';
import { MapConfig, AvailableGames, MapConfigID } from '../../../types/interfaces';
import areas from '../../aco/areas';
import { validateCloudAbility, customer } from '..';
import { checkCloudStatus, addResource, updateResource } from '../cloud';

const { aco } = db;

export async function getACOByMapName(mapName: string): Promise<MapConfig | null> {
	return new Promise(res => {
		aco.findOne({ map: mapName }, (err, acoConfig) => {
			if (err) {
				return res(null);
			}

			if (!acoConfig) {
				return res(null);
			}

			if (!customer.customer || customer.customer.license.type === 'free') {
				return res(null);
			}

			if (customer.customer.license.type === 'personal') {
				return res({ ...acoConfig, areas: acoConfig.areas.slice(0, 4) });
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

export const loadNewConfigs = () => {
	getACOs().then(acos => {
		areas.areas = acos;
	});
};
export const updateACO = (config: MapConfig | MapConfigID) =>
	new Promise<MapConfig | null>(res => {
		getACOByMapName(config.map).then(async oldConfig => {
			let cloudStatus = false;
			if (await validateCloudAbility()) {
				cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
			}

			if (!oldConfig) {
				aco.insert(config, async (err, newConfig) => {
					if (err) {
						return res(null);
					}
					if (cloudStatus) {
						await addResource(customer.game as AvailableGames, 'mapconfigs', newConfig);
					}
					return res(newConfig);
				});
			} else {
				if (!('_id' in config)) {
					return res(null);
				}
				aco.update({ _id: config._id }, config, {}, async (err, n) => {
					if (err) {
						return res(null);
					}
					loadNewConfigs();
					if (cloudStatus) {
						await updateResource(customer.game as AvailableGames, 'mapconfigs', {
							...config,
							_id: config._id
						});
					}
					return res(config);
				});
			}
		});
	});

export const replaceLocalMapConfigs = (newMapConfigs: MapConfigID[], game: AvailableGames, existing: string[]) =>
	new Promise<boolean>(res => {
		const or: any[] = [
			{ game, _id: { $nin: existing } },
			{ game, _id: { $in: newMapConfigs.map(mapConfig => mapConfig._id) } }
		];
		if (game === 'csgo') {
			or.push(
				{ game: { $exists: false }, _id: { $nin: existing } },
				{ game: { $exists: false }, _id: { $in: newMapConfigs.map(mapConfig => mapConfig._id) } }
			);
		}
		aco.remove({ $or: or }, { multi: true }, err => {
			if (err) {
				return res(false);
			}
			aco.insert(newMapConfigs, (err, docs) => {
				loadNewConfigs();
				return res(!err);
			});
		});
	});

loadNewConfigs();
