import db from './../../../init/database';
import { CustomFieldEntry, CustomFieldStore, Player } from '../../../types/interfaces';
import { initiateCustomFields } from '../teams';

const { players, custom } = db;

export async function getPlayerById(id: string, avatar = false): Promise<Player | null> {
	return new Promise(res => {
		players.findOne({ _id: id }, (err, player) => {
			if (err) {
				return res(null);
			}
			if (!avatar && player && player.avatar) delete player.avatar;
			return res(player);
		});
	});
}
export async function getPlayerBySteamId(steamid: string, avatar = false): Promise<Player | null> {
	return new Promise(res => {
		players.findOne({ steamid }, (err, player) => {
			if (err) {
				return res(null);
			}
			if (!avatar && player && player.avatar) delete player.avatar;
			return res(player);
		});
	});
}

export const getPlayersList = (query: any) =>
	new Promise<Player[]>(res => {
		players.find(query, (err, players) => {
			if (err) {
				return res([]);
			}
			return res(players);
		});
	});

export const getPlayerFields = async () => {
	const store = await initiateCustomFields();
	if (!store) return [];
	return store.players;
};

export const updatePlayerFields = async (playerFields: CustomFieldEntry[]) => {
	const store = await initiateCustomFields();

	const deletedFields = store.players.filter(field => !playerFields.find(newField => newField.name === field.name));
	const createdFields = playerFields.filter(newField => !store.players.find(field => field.name === newField.name));

	return new Promise<CustomFieldStore>(res => {
		custom.update({}, { $set: { players: playerFields } }, { multi: true }, async () => {
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
			players.update({}, updateQuery, { multi: true }, async () => {
				res(await initiateCustomFields());
			});
		});
	});
};
