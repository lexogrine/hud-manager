import db from './../../../init/database';
import { Team } from '../../../types/interfaces';

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
