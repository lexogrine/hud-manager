import db from './../../../init/database';
import { Team, AvailableGames } from '../../../types/interfaces';

const { teams } = db;

export async function getTeamById(id: string, logo = false): Promise<Team | null> {
	return new Promise(res => {
		teams.findOne({ _id: id }, (err, team) => {
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
		teams.find(query, (err: Error, teams: Team[]) => {
			if (err) {
				return res([]);
			}
			return res([...teams].sort((a, b) => (a.name > b.name ? 1 : -1)));
		});
	});

export const addTeams = (newTeams: Team[]) => {
	return new Promise<Team[] | null>(res => {
		teams.insert(newTeams, (err, docs) => {
			if (err) return res(null);

			return res(docs);
		});
	});
};
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
