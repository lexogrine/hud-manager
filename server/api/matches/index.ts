import { Match, RoundData, AvailableGames } from '../../../types/interfaces';
import { GSI, ioPromise } from './../../socket';
import db from './../../../init/database';
import { getTeamById } from './../teams';
import uuidv4 from 'uuid/v4';
import { CSGO, RoundOutcome } from 'csgogsi-socket';
import { customer } from '..';

const matchesDb = db.matches;

export const getMatches = (query: any): Promise<Match[]> => {
	return new Promise(res => {
		matchesDb.find(query, (err: Error, matches: Match[]) => {
			if (err) {
				return res([]);
			}
			return res(matches);
		});
	});
};

export const getActiveGameMatches = (): Promise<Match[]> => {
	const game = customer.game;
	const $or: any[] = [{ game }];
	if (game === 'csgo') {
		$or.push({ game: { $exists: false } });
	}
	return getMatches({ $or });
};

export async function getMatchById(id: string): Promise<Match | null> {
	return new Promise(res => {
		matchesDb.findOne({ id }, (err, match) => {
			if (err) {
				return res(null);
			}
			return res(match);
		});
	});
}

export const setMatches = (matches: Match[]): Promise<Match[] | null> => {
	return new Promise(res => {
		matchesDb.remove({}, { multi: true }, err => {
			if (err) {
				return res(null);
			}
			matchesDb.insert(matches, (err, added) => {
				if (err) {
					return res(null);
				}
				return res(added);
			});
		});
	});
};

export const updateMatches = async (updateMatches: Match[]) => {
	const currents = updateMatches.filter(match => match.current);
	if (currents.length > 1) {
		updateMatches = updateMatches.map(match => ({ ...match, current: false }));
	}
	if (currents.length) {
		const left = await getTeamById(currents[0].left.id || '');
		const right = await getTeamById(currents[0].right.id || '');

		if (left && left._id) {
			GSI.teams.left = {
				id: left._id,
				name: left.name,
				country: left.country,
				logo: left.logo,
				map_score: currents[0].left.wins,
				extra: left.extra
			};
		}
		if (right && right._id) {
			GSI.teams.right = {
				id: right._id,
				name: right.name,
				country: right.country,
				logo: right.logo,
				map_score: currents[0].right.wins,
				extra: right.extra
			};
		}
	}

	const matchesFixed = updateMatches.map(match => {
		if (match.id.length) return match;
		match.id = uuidv4();
		return match;
	});

	await setMatches(matchesFixed);
};

export const addMatch = (match: Match) =>
	new Promise(res => {
		if (!match.id) {
			match.id = uuidv4();
		}
		match.current = false;
		matchesDb.insert(match, async (err, doc) => {
			if (err) return res(null);
			/* if (validateCloudAbility()) {
				await addResource(customer.game as AvailableGames, 'matches', doc);
			} */
			return res(doc);
		});
	});

export const deleteMatch = (id: string) =>
	new Promise(res => {
		matchesDb.remove({ id }, async err => {
			if (err) return res(false);
			/* if (validateCloudAbility()) {
				await deleteResource(customer.game as AvailableGames, 'matches', id);
			} */
			return res(true);
		});
	});

export const getCurrent = async () => {
	const activeGameMatches = await getActiveGameMatches();

	return activeGameMatches.find(match => match.current);
};

/*
export const setCurrent = (id: string) =>
	new Promise(res => {
		matchesDb.update({}, { current: false }, { multi: true }, err => {
			if (err) return res(null);
			matchesDb.update({ id }, { current: true }, {}, err => {
				if (err) return res(null);
				return res();
			});
		});
	});
*/
export const updateMatch = (match: Match) =>
	new Promise(res => {
		matchesDb.update({ id: match.id }, match, {}, err => {
			if (err) return res(false);
			if (!match.current) return res(true);
			matchesDb.update(
				{
					$where: function () {
						return this.current && this.id !== match.id && this.game === match.game;
					}
				},
				{ $set: { current: false } },
				{ multi: true },
				async err => {
					const left = await getTeamById(match.left.id || '');
					const right = await getTeamById(match.right.id || '');

					if (left && left._id) {
						GSI.teams.left = {
							id: left._id,
							name: left.name,
							country: left.country,
							logo: left.logo,
							map_score: match.left.wins,
							extra: left.extra
						};
					}
					if (right && right._id) {
						GSI.teams.right = {
							id: right._id,
							name: right.name,
							country: right.country,
							logo: right.logo,
							map_score: match.right.wins,
							extra: right.extra
						};
					}
					/* if (validateCloudAbility()) {
						await updateResource(customer.game as AvailableGames, 'matches', match);
					} */
					if (err) return res(false);
					return res(true);
				}
			);
		});
	});

export const reverseSide = async () => {
	const io = await ioPromise;
	const matches = await getActiveGameMatches();
	const current = matches.find(match => match.current && match.game === customer.game);
	if (!current) return;
	if (current.vetos.filter(veto => veto.teamId).length > 0 && !GSI.last) {
		return;
	}
	if (current.vetos.filter(veto => veto.teamId).length === 0) {
		current.left = [current.right, (current.right = current.left)][0];
		await updateMatch(current);
		return io.emit('match', true);
	}
	const currentVetoMap = current.vetos.find(veto => GSI.last?.map.name.includes(veto.mapName));
	if (!currentVetoMap) return;
	currentVetoMap.reverseSide = !currentVetoMap.reverseSide;
	await updateMatch(current);

	io.emit('match', true);
};

export const updateRound = async (game: CSGO) => {
	const getWinType = (round_win: RoundOutcome) => {
		switch (round_win) {
			case 'ct_win_defuse':
				return 'defuse';
			case 'ct_win_elimination':
			case 't_win_elimination':
				return 'elimination';
			case 'ct_win_time':
				return 'time';
			case 't_win_bomb':
				return 'bomb';
			default:
				return 'time';
		}
	};
	if (!game || !game.map || game.map.phase !== 'live') return;

	let round = game.map.round;

	if (game.round && game.round.phase !== 'over') {
		round++;
	}

	const roundData: RoundData = {
		round,
		players: {},
		winner: null,
		win_type: 'bomb'
	};

	if (game.round && game.round.win_team && game.map.round_wins && game.map.round_wins[round]) {
		roundData.winner = game.round.win_team;
		roundData.win_type = getWinType(game.map.round_wins[round]);
	}
	for (const player of game.players) {
		roundData.players[player.steamid] = {
			kills: player.state.round_kills,
			killshs: player.state.round_killhs,
			damage: player.state.round_totaldmg
		};
	}

	const matches = await getActiveGameMatches();
	const match = matches.find(match => match.current);

	if (!match) return;

	const mapName = game.map.name.substring(game.map.name.lastIndexOf('/') + 1);
	const veto = match.vetos.find(veto => veto.mapName === mapName && !veto.mapEnd);

	if (!veto || veto.mapEnd) return;
	if (
		veto.rounds &&
		veto.rounds[roundData.round - 1] &&
		JSON.stringify(veto.rounds[roundData.round - 1]) === JSON.stringify(roundData)
	)
		return;

	match.vetos = match.vetos.map(veto => {
		if (veto.mapName !== mapName) return veto;
		if (!veto.rounds) veto.rounds = [];
		veto.rounds[roundData.round - 1] = roundData;
		veto.rounds = veto.rounds.splice(0, roundData.round);
		return veto;
	});

	return updateMatch(match);
};

export const replaceLocalMatches = (newMatches: Match[], game: AvailableGames) =>
	new Promise<boolean>(res => {
		const or: any[] = [{ game }];
		if (game === 'csgo') {
			or.push({ game: { $exists: false } });
		}
		matchesDb.remove({ $or: or }, { multi: true }, err => {
			if (err) {
				return res(false);
			}
			matchesDb.insert(newMatches, (err, docs) => {
				return res(!err);
			});
		});
	});
