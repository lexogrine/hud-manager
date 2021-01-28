import * as I from '../api/interfaces';

export const getMatchName = (match: I.Match | undefined | null, teams: I.Team[], longNames = false) => {
	if (!match) return '';
	if (!teams.length || !match.left.id || !match.right.id) return match.id;
	const left = teams.find(team => team._id === match.left.id);
	const right = teams.find(team => team._id === match.right.id);
	if (!left || !right) return match.id;

	if (longNames) {
		return `${left.name} (${match.left.wins}) vs (${match.right.wins}) ${right.name}`;
	}

	return `${left.shortName} (${match.left.wins}) vs (${match.right.wins}) ${right.shortName}`;
};
