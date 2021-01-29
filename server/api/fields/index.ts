import db from './../../../init/database';
import { CustomFieldEntry, CustomFieldStore } from '../../../types/interfaces';

const { custom } = db;

export const initiateCustomFields = () =>
	new Promise<CustomFieldStore>(res => {
		custom.findOne({}, (err, store) => {
			if (store) {
				return res(store);
			}
			const customFields = { players: [], teams: [] };
			custom.insert(customFields, (err, entry) => {
				return res(entry);
			});
		});
	});

export const getFields = async (type: keyof CustomFieldStore) => {
	const store = await initiateCustomFields();
	if (!store) return [];
	return store[type];
};

export const updateFields = async (fields: CustomFieldEntry[], type: keyof CustomFieldStore) => {
	const store = await initiateCustomFields();

	const deletedFields = store[type].filter(field => !fields.find(newField => newField.name === field.name));
	const createdFields = fields.filter(newField => !store[type].find(field => field.name === newField.name));

	const fieldNames = fields.map(field => field.name);

	if (fieldNames.length !== [...new Set(fieldNames)].length) {
		return await initiateCustomFields();
	}

	return new Promise<CustomFieldStore>(res => {
		custom.update({}, { $set: { teams: fields } }, { multi: true }, async () => {
			if (!deletedFields.length && !createdFields.length) {
				return res(await initiateCustomFields());
			}
			const updateQuery = {
				$unset: {},
				$set: {}
			};
			for (const deletedField of deletedFields) {
				updateQuery.$unset[`extra.${deletedField.name}`] = true;
			}
			for (const createdField of createdFields) {
				updateQuery.$set[`extra.${createdField.name}`] = '';
			}
			db[type].update({}, updateQuery, { multi: true }, async () => {
				res(await initiateCustomFields());
			});
		});
	});
};
