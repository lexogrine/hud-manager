import db from './../../../init/database';
import { Player, AvailableGames } from '../../../types/interfaces';

const { players } = db;

export async function getPlayerById(id: string, avatar = false): Promise<Player | null> {
	return new Promise(res => {
		players.findOne({ _id: id }, (err, player) => {
			if (err) {
				return res(null);
			}
			if (!avatar && player && player.avatar) player.avatar = '';
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
			if (!avatar && player && player.avatar) player.avatar = '';
			return res(player);
		});
	});
}

export const getPlayersList = (query: any) =>
	new Promise<Player[]>(res => {
		players.find(query, (err: Error, players: Player[]) => {
			if (err) {
				return res([]);
			}
			return res([...players].sort((a, b) => (a.username > b.username ? 1 : -1)));
		});
	});

export const replaceLocalPlayers = (newPlayers: Player[], game: AvailableGames, existing: string[]) =>
	new Promise<boolean>(res => {
		const toRemove = { $or: [{ $in: newPlayers.map(store => store._id) }, { $nin: existing }]};

		const or: any[] = [{ game, _id: toRemove }];
		if (game === 'csgo') {
			or.push({ game: { $exists: false }, _id: toRemove });
		}
		players.remove({ $or: or }, { multi: true }, (err, n) => {
			if (err) {
				return res(false);
			}
			console.log('removed',n,'players')
			players.insert(newPlayers, (err, docs) => {
				return res(!err);
			});
		});
	});
