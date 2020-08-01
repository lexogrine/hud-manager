import * as I from './../../../types/interfaces';
import * as Formats from './formats';
import * as M from './../match';
import db from './../../../init/database';

const { tournaments } = db;

const createTournament = (type: string, teams: number): Omit<I.Tournament, "_id"> => {
    const tournament = {
        name: '',
        label: '',
        logo: '',
        matchups: [],
        autoCreate: true,
    }
    switch(type){
        case "se":
            tournament.matchups = Formats.createSEBracket(teams);
        break;
        default:

        break;
    }
    return tournament;
}

const getTournament = (tournamentId: string): Promise<I.Tournament | null> => new Promise((res, rej) => {
    tournaments.findOne({ _id: tournamentId }, (err, tournament) => {
        if(err || !tournament) return res(null);
        return res(tournament);
    });
});

const bindMatch = async (matchId: string, matchupId: string, tournamentId: string) => {
    const tournament = await getTournament(tournamentId);
    if(!tournament) return;
    tournament.matchups.forEach(matchup => {
        if(!matchup || matchup._id !== matchupId) return;
        matchup.matchId = matchId;
    });
}

const createNextMatch = async (matchId: string) => new Promise((res, rej) => {
    const maxWins = (type: I.BOTypes) => {
        switch(type){
            case "bo1":
                return 1;
            case "bo3":
                return 2;
            case "bo5":
                return 3;
            default:
                return 2;
        }
    }

    tournaments.findOne({ $where: function() { return !!this.matchups.find(matchup => matchup.matchId === matchId) } }, async (err, tournament) => {
        if(err || !tournament) return res(null);
        const matchup = tournament.matchups.find(matchup => matchup.matchId === matchId);
        if(!matchup || !matchup.winner_to) return res(null);
        
        const nextMatchup = tournament.matchups.find(next => next._id === matchup.winner_to);
        if(!nextMatchup) return res(null);

        const match = await M.getMatchById(matchId);
        if(!match) return res(null);
        
        const winsRequired = maxWins(match.matchType);

        
    });
});
