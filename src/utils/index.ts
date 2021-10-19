import moment from 'moment';
import { RequiredFields } from '../../types/interfaces';
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

export const getMissingFields = (currentFields: I.CustomFieldStore, requiredFields?: RequiredFields) => {
	if (!requiredFields) {
		return;
	}

	const missingFields: RequiredFields = {};

	if (requiredFields.players) {
		for (const [field, type] of Object.entries(requiredFields.players)) {
			if (!currentFields.players.find(playerField => playerField.name === field && playerField.type === type)) {
				if (!missingFields.players) {
					missingFields.players = {};
				}
				missingFields.players[field] = type;
			}
		}
	}

	if (requiredFields.teams) {
		for (const [field, type] of Object.entries(requiredFields.teams)) {
			if (!currentFields.teams.find(teamField => teamField.name === field && teamField.type === type)) {
				if (!missingFields.teams) {
					missingFields.teams = {};
				}
				missingFields.teams[field] = type;
			}
		}
	}

	if (!missingFields.players && !missingFields.teams) {
		return;
	}

	return missingFields;
};

export const filterMatches = (match: I.Match, activeTab: string) => {
	const boToWinsMap = {
		1: 1,
		2: 2,
		3: 2,
		5: 3
	};
	const picks = (match.vetos || []).filter(veto => match.game !== 'csgo' || (veto as I.CSGOVeto).type !== 'ban');
	let isEnded = false;
	const bo = parseInt((match.matchType || 'bo1').replace('bo', '')) as 1 | 2 | 3 | 5;

	if (bo === 2) {
		isEnded = picks.filter(pick => pick.mapEnd).length === 2 || match.left.wins + match.right.wins >= 2;
	} else {
		isEnded =
			(match.left && match.left.wins === boToWinsMap[bo]) ||
			(match.right && match.right.wins === boToWinsMap[bo]);
	}
	if (activeTab === 'ended') {
		return isEnded;
	}
	if (isEnded) {
		return false;
	}

	const isInFuture = Boolean(match.startTime && moment(match.startTime).isAfter(moment(), 'day'));

	return isInFuture === (activeTab === 'future');
};
