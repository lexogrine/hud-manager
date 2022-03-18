import { databaseContext } from './../../../init/database';
import { Player, AvailableGames } from '../../../types/interfaces';
import Excel from 'exceljs';
import { customer } from '..';
import { getTeamsList } from '../teams';

export async function getPlayerById(id: string, avatar = false): Promise<Player | null> {
	return new Promise(res => {
		if (!databaseContext.databases.players) return res(null);
		databaseContext.databases.players.findOne({ _id: id }, (err, player) => {
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
		if (!databaseContext.databases.players) return res(null);
		databaseContext.databases.players.findOne({ steamid }, (err, player) => {
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
		if (!databaseContext.databases.players) return res([]);
		databaseContext.databases.players.find(query, (err: Error, players: Player[]) => {
			if (err) {
				return res([]);
			}
			return res([...players].sort((a, b) => (a.username > b.username ? 1 : -1)));
		});
	});

export const addPlayers = (newPlayers: Player[]) => {
	return new Promise<Player[] | null>(res => {
		if (!databaseContext.databases.players) return res(null);
		databaseContext.databases.players.insert(newPlayers, (err, docs) => {
			if (err) return res(null);

			return res(docs);
		});
	});
};

export const replaceLocalPlayers = (newPlayers: Player[], game: AvailableGames, existing: string[]) =>
	new Promise<boolean>(res => {
		if (!databaseContext.databases.players) return res(false);
		const or: any[] = [
			{ game, _id: { $nin: existing } },
			{ game, _id: { $in: newPlayers.map(player => player._id) } }
		];
		if (game === 'csgo') {
			or.push(
				{ game: { $exists: false }, _id: { $nin: existing } },
				{ game: { $exists: false }, _id: { $in: newPlayers.map(player => player._id) } }
			);
		}
		databaseContext.databases.players.remove({ $or: or }, { multi: true }, (err, n) => {
			if (err) {
				return res(false);
			}
			databaseContext.databases.players.insert(newPlayers, (err, docs) => {
				return res(!err);
			});
		});
	});

export const exportPlayers = async (file: string) => {
	const game = customer.game;
	const $or: any[] = [{ game }];
	if (game === 'csgo') {
		$or.push({ game: { $exists: false } });
	}


	const players = await getPlayersList({ $or });

	const teams = await getTeamsList({ $or });

	const usedTeams = teams.filter(team => players.find(player => player.team === team._id));

	const workbook = new Excel.Workbook();

	const sheet = workbook.addWorksheet('Players');

	sheet.addRow(['Username', 'SteamID', 'First Name', 'Last Name', 'Country Code', 'Team Name', 'Avatar']);

	sheet.properties.defaultColWidth = 20;
	sheet.getColumn(7).width = 18;
	
	for (const player of players) {
		const team = usedTeams.find(team => team._id === player.team);
		const row = sheet.addRow([
			player.username,
			player.steamid,
			player.firstName,
			player.lastName,
			player.country,
			team?.name
		]);

		if (player.avatar) {
			row.height = 100;
			const buffer = Buffer.from(player.avatar, 'base64');

			const avatarId = workbook.addImage({
				buffer,
				extension: 'png',
			});

			sheet.addImage(avatarId, {
				tl: { row: row.number - 1, col: 6 },
				ext: { width: 100, height: 100 }
			});
		}
	}

	workbook.xlsx.writeFile(file);
}
