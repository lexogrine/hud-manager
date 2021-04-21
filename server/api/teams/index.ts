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

export const replaceLocalTeams = (newTeams: Team[], game: AvailableGames, existing: string[]) =>
	new Promise<boolean>(res => {
		const toRemove = { $or: [{ $in: newTeams.map(store => store._id) }, { $nin: existing }]};

		const or: any[] = [{ game, _id: toRemove }];
		if (game === 'csgo') {
			or.push({ game: { $exists: false }, _id: toRemove });
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
