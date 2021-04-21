import db from './../../../init/database';
import { CustomFieldEntry, CustomFieldStore, AvailableGames } from '../../../types/interfaces';
import { validateCloudAbility, customer } from '..';
import { checkCloudStatus, updateResource } from '../cloud';

const { custom } = db;

export const initiateCustomFields = (game: AvailableGames = 'csgo', dontCreateOnCall = false) =>
	new Promise<CustomFieldStore>(res => {
		const or: any[] = [{ game }];
		if (game === 'csgo') {
			or.push({ game: { $exists: false } });
		}
		custom.findOne({ $or: or }, (err, store) => {
			if (store) {
				return res(store);
			}
			if (dontCreateOnCall) {
				return res(null as any);
			}
			const customFields = { players: [], teams: [], game };
			custom.insert(customFields, (err, entry) => {
				return res(entry);
			});
		});
	});

export const replaceLocalCustomFieldStores = (stores: CustomFieldStore[], game: AvailableGames) =>
	new Promise<boolean>(res => {
		const or: any[] = [{ game }];
		if (game === 'csgo') {
			or.push({ game: { $exists: false } });
		}
		custom.remove({ $or: or }, { multi: true }, err => {
			if (err) {
				return res(false);
			}
			custom.insert(stores, (err, docs) => {
				return res(!err);
			});
		});
	});

export const getCustomFieldsDb = async (game: AvailableGames) => {
	const customFields = await initiateCustomFields(game, true);
	if (!customFields) return [];
	return [customFields];
};

export const getFields = async (type: keyof CustomFieldStore, game: AvailableGames) => {
	const store = await initiateCustomFields(game, true);
	if (!store) return [];
	return store[type];
};

export const updateFields = async (fields: CustomFieldEntry[], type: keyof CustomFieldStore, game: AvailableGames) => {
	const store = await initiateCustomFields(game);

	const deletedFields = store[type].filter(field => !fields.find(newField => newField.name === field.name));
	const createdFields = fields.filter(newField => !store[type].find(field => field.name === newField.name));

	let cloudStatus = false;
	if (validateCloudAbility()) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}

	return new Promise<CustomFieldStore>(res => {
		custom.update({}, { $set: { [type]: fields } }, { multi: true }, async () => {
			if (!deletedFields.length && !createdFields.length) {
				return res(await initiateCustomFields(game));
			}
			const updateQuery = {
				$unset: {},
				$set: {}
			} as any;
			for (const deletedField of deletedFields) {
				updateQuery.$unset[`extra.${deletedField.name}`] = true;
			}
			for (const createdField of createdFields) {
				updateQuery.$set[`extra.${createdField.name}`] = '';
			}
			db[type].update({}, updateQuery, { multi: true }, async () => {
				const result = await initiateCustomFields(game);
				if (cloudStatus) {
					await updateResource(customer.game as AvailableGames, 'customs', result);
				}
				res(result);
			});
		});
	});
};
