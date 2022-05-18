import { databaseContext } from './../../../init/database';
import { Team, AvailableGames } from '../../../types/interfaces';
import Excel from 'exceljs';
import { customer } from '..';

export async function getTeamById(id: string, logo = false): Promise<Team | null> {
	return new Promise(res => {
		if (!databaseContext.databases.teams) return res(null);
		databaseContext.databases.teams.findOne({ _id: id }, (err, team) => {
			if (err) {
				return res(null);
			}
			if (!logo && team && team.logo) team.logo = '';
			return res(team);
		});
	});
}

export const getTeamsList = (query: any) =>
	new Promise<Team[]>(res => {
		if (!databaseContext.databases.teams) return res([]);
		databaseContext.databases.teams.find(query, (err: Error, teams: Team[]) => {
			if (err) {
				return res([]);
			}
			return res([...teams].sort((a, b) => (a.name > b.name ? 1 : -1)));
		});
	});

export const addTeams = (newTeams: Team[]) => {
	return new Promise<Team[] | null>(res => {
		if (!databaseContext.databases.teams) return res(null);
		databaseContext.databases.teams.insert(newTeams, (err, docs) => {
			if (err) return res(null);

			return res(docs);
		});
	});
};
export const replaceLocalTeams = (newTeams: Team[], game: AvailableGames, existing: string[]) =>
	new Promise<boolean>(res => {
		if (!databaseContext.databases.teams) return res(false);
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
		databaseContext.databases.teams.remove({ $or: or }, { multi: true }, err => {
			if (err) {
				return res(false);
			}
			databaseContext.databases.teams.insert(newTeams, (err, docs) => {
				return res(!err);
			});
		});
	});


export const exportTeams = async (file: string) => {
	const game = customer.game;
	const $or: any[] = [{ game }];
	if (game === 'csgo') {
		$or.push({ game: { $exists: false } });
	}

	const teams = await getTeamsList({ $or });

	const workbook = new Excel.Workbook();

	const sheet = workbook.addWorksheet('Players');

	sheet.addRow(['Team name', 'Short name', 'Country Code', 'Logo']);

	sheet.properties.defaultColWidth = 20;
	sheet.getColumn(7).width = 18;

	for (const team of teams) {
		const row = sheet.addRow([
			team.name,
			team.shortName,
			team.country
		]);

		if (team.logo) {
			row.height = 100;
			const buffer = Buffer.from(team.logo, 'base64');

			const logoId = workbook.addImage({
				buffer,
				extension: 'png'
			});

			sheet.addImage(logoId, {
				tl: { row: row.number - 1, col: 3 },
				ext: { width: 100, height: 100 }
			});
		}
	}

	workbook.xlsx.writeFile(file);
};

