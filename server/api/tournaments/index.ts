import * as I from './../../../types/interfaces';
import * as Formats from './formats';
import * as M from './../match';
import uuidv4 from 'uuid/v4';
import db from './../../../init/database';

const { tournaments } = db;

export const getTournaments = (): Promise<I.Tournament[]> =>
	new Promise(res => {
		tournaments.find({}, (err, docs) => {
			if (err) return res([]);
			return res(docs);
		});
	});

export const createTournament = (type: string, teams: number): I.Tournament => {
	const tournament = {
		_id: '',
		name: '',
		logo: '',
		matchups: [],
		autoCreate: true
	};
	switch (type) {
		case 'se':
			tournament.matchups = Formats.createSEBracket(teams);
			break;
		case 'de':
			tournament.matchups = Formats.createDEBracket(teams);
			break;
		default:
			break;
	}
	return tournament;
};

export const getTournamentByMatchId = async (matchId: string) => {
	const tournaments = await getTournaments();
	const tournament = tournaments.find(trnm => !!trnm.matchups.find(matchup => matchup.matchId === matchId));

	return tournament || null;
};

export const addTournament = (tournament: I.Tournament): Promise<I.Tournament> =>
	new Promise(res => {
		tournaments.insert(tournament, (err, newTournament) => {
			if (err) return res(null);
			return res(newTournament);
		});
	});

export const getTournament = (tournamentId: string): Promise<I.Tournament | null> =>
	new Promise(res => {
		tournaments.findOne({ _id: tournamentId }, (err, tournament) => {
			if (err || !tournament) return res(null);
			return res(tournament);
		});
	});

export const updateTournament = (tournament: I.Tournament): Promise<I.Tournament | null> =>
	new Promise(res => {
		tournaments.update({ _id: tournament._id }, tournament, {}, err => {
			if (err) return res(null);
			return res(tournament);
		});
	});

export const bindMatch = async (
	matchId: string,
	matchupId: string,
	tournamentId: string
): Promise<I.Tournament | null> => {
	const tournament = await getTournament(tournamentId);
	if (!tournament) return null;
	const matchup = tournament.matchups.find(matchup => matchup._id === matchupId);
	if (!matchup) return null;
	matchup.matchId = matchId;

	return await updateTournament(tournament);
};

export const fillNextMatch = (matchId: string, type: 'winner' | 'loser') =>
	new Promise(res => {
		const maxWins = (type: I.BOTypes) => {
			switch (type) {
				case 'bo1':
					return 1;
				case 'bo3':
					return 2;
				case 'bo5':
					return 3;
				default:
					return 2;
			}
		};

		tournaments.findOne(
			{
				$where: function () {
					return !!this.matchups.find(matchup => matchup.matchId === matchId);
				}
			},
			async (err, tournament) => {
				if (err || !tournament) return res(null);
				const matchup = tournament.matchups.find(matchup => matchup.matchId === matchId);
				if (!matchup || (!matchup.winner_to && type === 'winner') || (!matchup.loser_to && type === 'loser'))
					return res(null);

				const nextMatchup = tournament.matchups.find(
					next =>
						(next._id === matchup.winner_to && type === 'winner') ||
						(next._id === matchup.loser_to && type === 'loser')
				);
				if (!nextMatchup) return res(null);

				const match = await M.getMatchById(matchId);
				if (!match) return res(null);

				const winsRequired = maxWins(match.matchType);

				if (match.left.wins !== winsRequired && match.right.wins !== winsRequired) return res(null);

				const winnerId = match.left.wins > match.right.wins ? match.left.id : match.right.id;
				const loserId = match.left.wins > match.right.wins ? match.right.id : match.left.id;

				if (!nextMatchup.matchId) {
					const newMatch: I.Match = {
						id: uuidv4(),
						current: false,
						left: { id: type === 'winner' ? winnerId : loserId, wins: 0 },
						right: { id: null, wins: 0 },
						matchType: 'bo1',
						vetos: []
					};

					for (let i = 0; i < 7; i++) {
						newMatch.vetos.push({
							teamId: '',
							mapName: '',
							side: 'NO',
							type: 'pick',
							mapEnd: false,
							reverseSide: false
						});
					}

					const resp = await M.addMatch(newMatch);
					if (!resp) return res(null);

					nextMatchup.matchId = newMatch.id;
					await updateTournament(tournament);
				}

				const nextMatch = await M.getMatchById(nextMatchup.matchId);
				if (!nextMatch) return res(null);

				const teamIds = [nextMatch.left.id, nextMatch.right.id];

				if (
					(teamIds.includes(winnerId) && type === 'winner') ||
					(teamIds.includes(loserId) && type === 'loser')
				)
					return res(nextMatch);
				if (!nextMatch.left.id) {
					nextMatch.left.id = type === 'winner' ? winnerId : loserId;
				} else if (!nextMatch.right.id) {
					nextMatch.right.id = type === 'winner' ? winnerId : loserId;
				} else {
					return res(null);
				}
				await M.updateMatch(nextMatch);
				return res(nextMatch);
			}
		);
	});

export const createNextMatch = async (matchId: string) => {
	try {
		await Promise.all([fillNextMatch(matchId, 'winner'), fillNextMatch(matchId, 'loser')]);
	} catch {
		return;
	}
};

export const deleteTournament = (tournamentId: string) =>
	new Promise(res => {
		tournaments.remove({ _id: tournamentId }, err => {
			if (err) return res(null);
			return res(true);
		});
	});
