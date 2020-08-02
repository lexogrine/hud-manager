import uuidv4 from 'uuid/v4';
import * as I from './../../../types/interfaces';

const createMatchup = (): I.TournamentMatchup => ({
    _id: uuidv4(),
    winner_to: null,
    loser_to: null,
    label: '',
    matchId: null
});

export const createSEBracket = (teams: number) => {
    if (!Number.isInteger(Math.log2(teams))) return [];
    const amountOfMatches = teams - 1;
    const phases = Math.log2(teams);

    const matchups: I.TournamentMatchup[] = [];

    for(let i = 0; i < phases; i++){
        const matchesInPhase = 2**i;
        for(let j = 0; j < matchesInPhase; j++){
            const match = createMatchup();
            const index = matchups.length;
            if(i === 0) continue;
            const parentIndex = Math.floor((index - 1)/2);
            match.winner_to = matchups[parentIndex]._id;
            matchups.push(match);
        }
    }

    return matchups;
};

