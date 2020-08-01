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
    const amountOfMatches = teams - 1;
    const phases = Math.log2(teams);

    const matches: I.TournamentMatchup[] = [];

    for(let i = 0; i < phases; i++){
        const matchesInPhase = 2**i;
        for(let j = 0; j < matchesInPhase; j++){
            const match = createMatchup();
            const index = matches.length;
            if(i === 0) continue;
            const parentIndex = Math.floor((index - 1)/2);
            match.winner_to = matches[parentIndex]._id;
            matches.push(match);
        }
    }

    return matches;
};

