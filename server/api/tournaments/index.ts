import * as I from './../../../types/interfaces';
import * as Formats from './formats';
import * as M from './../matches';
import uuidv4 from 'uuid/v4';
import db from './../../../init/database';

const { tournaments } = db;


export const parseLegacyMatchups = (matchup: I.LegacyTournamentMatchup | I.TournamentMatchup) => {
	if("stage" in matchup) return matchup;

	const newMatchup: I.TournamentMatchup = {
		_id: matchup._id,
		loser_to: matchup.loser_to,
		winner_to: matchup.winner_to,
		label: matchup.label,
		stage: null,
		matchId: matchup.matchId,
		parents: matchup.parents.map(parent => parseLegacyMatchups(parent))
	}

	return newMatchup;
}

export const parseLegacyTournament = (tournament: I.LegacyTournament | I.Tournament) => {
	if(!("matchups" in tournament)) return tournament;

	const newTournament: I.Tournament = {
		_id: tournament._id,
		name: tournament.name,
		logo: tournament.logo,
		groups: [],
		playoffs: {
			teams: 16,
			type: 'double',
			participants: [],
			phases: 0,
			matchups: tournament.matchups.map(matchup => parseLegacyMatchups(matchup)),
		},
		autoCreate: tournament.autoCreate
	}

	return newTournament;
}
export const getTournaments = (opts: any = {}): Promise<I.Tournament[]> =>
	new Promise(res => {
		tournaments.find(opts, (err: any, docs: I.Tournament[]) => {
			if (err) return res([]);
			return res(docs.map(doc => parseLegacyTournament(doc)));
		});
	});

export const createTournament = (type: I.TournamentTypes,
	teams: number,
	groupType?: I.TournamentTypes,
	groupTeams?: number,
	phases?: number,
	groupPhases?: number,
	participants?: string[],
	groupParticipants?: string[]
): I.Tournament => {
	const tournament: I.Tournament = {
		_id: '',
		name: '',
		logo: '',
		groups: [],
		playoffs: {
			type: 'single',
			teams,
			phases: 0,
			participants: [],
			matchups: []
		},
		autoCreate: true
	};
	switch (type) {
		case 'single':
			tournament.playoffs.matchups = Formats.createSEBracket(teams);
			break;
		case 'double':
			tournament.playoffs.type = 'double';
			tournament.playoffs.matchups = Formats.createDEBracket(teams);
			break;
		case 'swiss':
			tournament.playoffs.type = 'swiss';
			tournament.playoffs.matchups = Formats.createSSBracket(participants?.length || 8, phases || 5);
			tournament.playoffs.phases = phases || 5;
			tournament.playoffs.participants = participants || [];
			break;
		default:
			break;
	}
	const amountOfGroupTeams = groupTeams || groupParticipants?.length;
	if(groupType && amountOfGroupTeams){
		tournament.groups.push({ participants: [], type: 'single', matchups: [], teams: amountOfGroupTeams, phases: 0 });
		switch (groupType) {
			case 'single':
				tournament.groups[0].matchups = Formats.createSEBracket(amountOfGroupTeams);
				break;
			case 'double':
				tournament.groups[0].type = 'double';
				tournament.groups[0].matchups = Formats.createDEBracket(amountOfGroupTeams);
				break;
			case 'swiss':
				tournament.groups[0].type = 'swiss';
				tournament.groups[0].matchups = Formats.createSSBracket(groupParticipants?.length || 8, groupPhases || 5);
				tournament.groups[0].phases = groupPhases || 5;
				tournament.groups[0].participants = groupParticipants || [];
				break;
			default:
				break;
		}
	}
	return tournament;
};

const getMatchupsFromTournament = (tournament: I.Tournament) => [...tournament.playoffs.matchups, ...tournament.groups.map(group => group.matchups).flat()]

export const getTournamentByMatchId = async (matchId: string) => {
	const tournaments = await getTournaments();

	const tournament = tournaments.find(tournament => getMatchupsFromTournament(tournament).find(matchup => matchup.matchId === matchId));

	return tournament || null;
};

export const addTournament = (tournament: I.Tournament): Promise<I.Tournament | null> =>
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
			return res(parseLegacyTournament(tournament));
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
	const matchup = getMatchupsFromTournament(tournament).find(matchup => matchup._id === matchupId);
	if (!matchup) return null;
	matchup.matchId = matchId;

	return await updateTournament(tournament);
};

const maxWins = (type: I.BOTypes) => {
	switch (type) {
		case 'bo1':
			return 1;
		case 'bo3':
			return 2;
		case 'bo5':
			return 3;
		case 'bo7':
			return 4;
		case 'bo9':
			return 5;
		default:
			return 2;
	}
};

export const fillNextMatches = async (matchId: string) => {
	const match = await M.getMatchById(matchId);
	const tournament = await getTournamentByMatchId(matchId);

	if (!tournament || !match) return null;

	const winsRequired = maxWins(match.matchType);

	if (match.left.wins !== winsRequired && match.right.wins !== winsRequired) return null;

	const currentMatchup = getMatchupsFromTournament(tournament).find(matchup => matchup.matchId === matchId);

	if (!currentMatchup) return null;

	const losersNextMatchup = getMatchupsFromTournament(tournament).find(matchup => matchup._id === currentMatchup.loser_to);
	const winnersNextMatchup = getMatchupsFromTournament(tournament).find(matchup => matchup._id === currentMatchup.winner_to);

	const winnerId = match.left.wins > match.right.wins ? match.left.id : match.right.id;
	const loserId = match.left.wins > match.right.wins ? match.right.id : match.left.id;

	if (losersNextMatchup) {
		let nextMatch = losersNextMatchup.matchId ? (await M.getMatchById(losersNextMatchup.matchId)) || null : null
		if (!nextMatch) {
			const newMatch: I.Match = {
				id: uuidv4(),
				current: false,
				left: { id: null, wins: 0 },
				right: { id: null, wins: 0 },
				matchType: 'bo1',
				vetos: [],
				startTime: 0,
				game: 'csgo'
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

			const response = await M.addMatch(newMatch);
			if(!response) return null;
			losersNextMatchup.matchId = response.id;

			nextMatch = response;
		}

		if(nextMatch.left.id !== loserId && nextMatch.right.id !== loserId){
			if(!nextMatch.left.id){
				nextMatch.left.id = loserId;
			} else if(!nextMatch.right.id){
				nextMatch.right.id = loserId;
			} else {
				return null;
			}
		}
		await M.updateMatch(nextMatch);
	}



	if (winnersNextMatchup) {
		let nextMatch = winnersNextMatchup.matchId ? (await M.getMatchById(winnersNextMatchup.matchId)) || null : null
		if (!nextMatch) {
			const newMatch: I.Match = {
				id: uuidv4(),
				current: false,
				left: { id: null, wins: 0 },
				right: { id: null, wins: 0 },
				matchType: 'bo1',
				vetos: [],
				startTime: 0,
				game: 'csgo'
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

			const response = await M.addMatch(newMatch);
			if(!response) return null;
			winnersNextMatchup.matchId = response.id;

			nextMatch = response;
		}
		if(nextMatch.left.id !== winnerId && nextMatch.right.id !== winnerId){
			if(!nextMatch.left.id){
				nextMatch.left.id = winnerId;
			} else if(!nextMatch.right.id){
				nextMatch.right.id = winnerId;
			} else {
				return null;
			}
		}
		await M.updateMatch(nextMatch);
	}

	await updateTournament(tournament);

}


export const createNextMatch = async (matchId: string) => {
	try {
		await fillNextMatches(matchId);
		//await Promise.all([fillNextMatch(matchId, 'winner'), fillNextMatch(matchId, 'loser')]);
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
