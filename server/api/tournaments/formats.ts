import uuidv4 from 'uuid/v4';
import * as I from './../../../types/interfaces';

const createMatchup = (stage: string | number | null = null): I.TournamentMatchup => ({
	_id: uuidv4(),
	winner_to: null,
	loser_to: null,
	stage,
	label: '',
	matchId: null,
	parents: []
});

export const createSSBracket = (teams: number, phases: number) => {
	const amountOfMatchups = teams*phases;

	const matchups: I.TournamentMatchup[] = [];

	for(let i = 0; i < amountOfMatchups; i++){
		matchups.push(createMatchup(Math.floor(i/teams)));
	}
	return matchups;
}

export const createSEBracket = (teams: number) => {
	if (!Number.isInteger(Math.log2(teams))) return [];

	const phases = Math.log2(teams);

	const matchups: I.TournamentMatchup[] = [];

	for (let i = 0; i < phases; i++) {
		const matchesInPhase = 2 ** i;
		for (let j = 0; j < matchesInPhase; j++) {
			const match = createMatchup();
			const index = matchups.length;
			if (i === 0) {
				matchups.push(match);
				continue;
			}
			const parentIndex = Math.floor((index - 1) / 2);
			match.winner_to = matchups[parentIndex]._id;
			matchups.push(match);
		}
	}

	return matchups;
};

export const createDEBracket = (teams: number) => {
	if (!Number.isInteger(Math.log2(teams))) return [];
	const upperBracket = createSEBracket(teams);

	if (!upperBracket.length) return [];

	if (teams === 2) {
		return upperBracket;
	}

	const grandFinal = createMatchup();
	upperBracket.push(grandFinal);
	upperBracket[0].winner_to = grandFinal._id;

	const grandFinalIndex = upperBracket.length - 1;

	const phases = Math.log2(teams / 2);
	for (let i = 0; i < phases; i++) {
		const lineMatches = 2 ** i;
		for (let j = 0; j < lineMatches; j++) {
			const loserAndWinner = createMatchup();
			const winnersOnly = createMatchup();

			const lAWI = lineMatches + j;
			loserAndWinner.winner_to = upperBracket[upperBracket.length - Math.ceil(lAWI / 2)]._id;
			upperBracket.push(loserAndWinner);

			winnersOnly.winner_to = upperBracket[upperBracket.length - lineMatches]._id;
			upperBracket.push(winnersOnly);
		}
	}
	for (let i = 0; i < grandFinalIndex; i++) {
		const upperHalf = teams / 2 - 1;
		if (i >= upperHalf) {
			const newI = Math.floor((i - upperHalf) / 2) + upperBracket.length - teams / 4;
			upperBracket[i].loser_to = upperBracket[newI]._id;
		} else {
			const phase = Math.floor(Math.log2(i + 1));
			const difference = 2 ** phase + grandFinalIndex;
			upperBracket[i].loser_to = upperBracket[i + difference]._id;
		}
	}
	return upperBracket;
};
