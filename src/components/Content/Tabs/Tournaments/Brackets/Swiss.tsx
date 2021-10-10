import { useState } from 'react';
import api from '../../../../../api/api';
import { IContextData } from '../../../../Context';
import BindModal from '../BindModal';
import * as I from './../../../../../api/interfaces';

interface Props {
    tournament: I.Tournament;
    stage: I.TournamentStage;
    cxt: IContextData;
}


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

const isMatchFinished = (match: I.Match) => {

    const winsRequired = maxWins(match.matchType);

    return match.left.wins === winsRequired || match.right.wins === winsRequired;
}

const isTeamInMatch = (team: I.Team, match: I.Match) => match.left.id === team._id || match.right.id === team._id;

interface TeamsRound { opponent: I.Team | null, matchup: I.TournamentMatchup, match: I.Match | null, phase: number }

interface TeamInStage {
    team: I.Team,
    series: { wins: number, losses: number },
    points: { wins: number, losses: number },
    rounds: TeamsRound[];
}

const getTeamEntry = (team: I.Team, teams: I.Team[], matchesForTeam: I.Match[], stage: I.TournamentStage) => {
    const { matchups, phases } = stage;

    const entry = { team, rounds: [], series: { wins: 0, losses: 0 }, points: { wins: 0, losses: 0 } } as TeamInStage;

    const finishedMatches: I.Match[] = [];

    for (let i = 0; i < phases; i++) {
        let matchup = matchups.find(matchup => matchup.stage === i && matchesForTeam.find(match => match.id === matchup.matchId));

        if (!matchup) {
            matchup = matchups.find(matchup => matchup.stage === i && !matchup.matchId);
        }
        if (!matchup) continue;

        const match = matchup.matchId ? matchesForTeam.find(match => match.id === (matchup as I.TournamentMatchup).matchId) || null : null;

        let opponent: I.Team | null = null;

        if (match) {
            if (isMatchFinished(match)) finishedMatches.push(match);
            opponent = teams.find(opp => opp._id !== team._id && (match.left.id === opp._id || match.right.id === opp._id)) || null;
        }

        entry.rounds.push({
            opponent,
            matchup,
            match,
            phase: i
        });
    }

    const seriesWins = finishedMatches.filter(match => match.left.id === team._id ? match.left.wins > match.right.wins : match.right.wins > match.left.wins).length;
    const seriesLosses = finishedMatches.filter(match => match.left.id !== team._id ? match.left.wins > match.right.wins : match.right.wins > match.left.wins).length;

    const scores = finishedMatches.map(match => match.vetos).flat().map(veto => veto.score).filter(score => !!score) as I.VetoScore[];

    const pointWins = scores.map(score => Number(score[team._id]) || 0).reduce((a, b) => a + b, 0);
    const pointLosses = scores.map(score => {
        const opponentId = Object.keys(score).find(teamId => teamId !== team._id);
        if (!opponentId) return 0;
        return Number(score[opponentId]) || 0;
    }).reduce((a, b) => a + b, 0);

    entry.series.wins = seriesWins;
    entry.series.losses = seriesLosses;
    entry.points.wins = pointWins;
    entry.points.losses = pointLosses;

    return entry;
}

const sortTeams = (teams: I.Team[], matches: I.Match[], stage: I.TournamentStage) => {

    const participants = teams.filter(team => stage.participants.includes(team._id));

    const entries = participants.map(team => getTeamEntry(team, teams, matches.filter(match => isTeamInMatch(team, match)), stage));

    entries.sort((teamA, teamB) => {
        if (teamA.series.wins !== teamB.series.wins) return teamB.series.wins - teamA.series.wins;
        return teamA.series.losses - teamB.series.losses;
    });

    return entries;

}

const RoundInfo = ({ round, setBindMatchupId, setBindOpen, setTeam, showEdit }: { showEdit?: boolean, round?: TeamsRound, setBindMatchupId: (id: string) => void, setBindOpen: (state: boolean) => void, setTeam: () => void }) => {
    const startBinding = () => {
        if(!round || round.match) return;
        setTeam();
        setBindMatchupId(round?.matchup._id);
        setBindOpen(true);
    }
    
    if(!round) return null;

    const { match, opponent } = round;

    if(!match) return showEdit ? <div className="" onClick={startBinding}>SET</div> : null;
    
    if(opponent){
        return (
            match.left.id === opponent._id ? <>{match.right.wins} - {match.left.wins}</> : <>{match.left.wins} - {match.right.wins}</>
        )
    }

    return <>{match.left.wins} - {match.right.wins}</>;
}

const SwissEntry = ({ entry, index, rounds, setBindMatchupId, setBindOpen, setTeam }: { entry: TeamInStage | null, setBindMatchupId: (id: string) => void, setTeam: (id: string) => void, setBindOpen: (state: boolean) => void, index: number, rounds: number, matchups: I.TournamentMatchup[] }) => {
    if (!entry) {
        const roundsLabels = [...Array(rounds)].map((_e: any, i) => <div key={`round-${i}-${index}`} className="team-round"></div>)
        return (
            <div className="item-list-entry">
                <div className="team-no">{index+1}</div>
                <div className="team-entry"></div>
                <div className="team-series">0 - 0</div>
                <div className="team-rounds">0 - 0</div>
                <div className="team-rd">0</div>
                {roundsLabels}
                <div className="options"></div>
            </div>
        );
    }
    const roundsLabels = [...Array(rounds)].map((_e: any, i) => <div key={`round-${i}-${index}`} className="team-round"><RoundInfo showEdit={!entry.rounds[i-1] || !!entry.rounds[i-1].match} setTeam={() => setTeam(entry.team._id)} round={entry.rounds[i]}  setBindMatchupId={setBindMatchupId} setBindOpen={setBindOpen}/></div>)
    return (
        <div className="item-list-entry">
            <div className="team-no">{index+1}</div>
            <div className="team-entry">{entry.team.name}</div>
            <div className="team-series">{entry.series.wins} - {entry.series.losses}</div>
            <div className="team-rounds">{entry.points.wins} - {entry.points.losses}</div>
            <div className="team-rd">{entry.points.wins - entry.points.losses}</div>
            {roundsLabels}
            <div className="options"></div>
        </div>
    );
};
const Swiss = ({ stage, tournament, cxt }: Props) => {
    const [ bindMatchId, setBindMatchId ] = useState('');
    const [ isBindOpen, setBindOpen ] = useState(false);
    const [ teamBinding, setTeam ] = useState(''); 
    const [ bindMatchupId, setBindMatchupId ] = useState('');

    const entries = sortTeams(cxt.teams, cxt.matches, stage);

    const roundsLabels = [...Array(stage.phases)].map((_e: any, i) => <div key={`round-${i}`} className="team-round">Round {i + 1}</div>);

    const closeBindModal = () => {
        setBindOpen(false);
        setBindMatchId('');
        setBindMatchupId('');
    }

    const bind = async () => {
		if (!tournament) return;
		await api.tournaments.bind(tournament._id, bindMatchId, bindMatchupId);
		await cxt.reload();
        closeBindModal();
	};

    return (
        <>

            <BindModal
                save={bind}
                teams={cxt.teams}
                matches={cxt.matches}
                isOpen={isBindOpen}
                matchId={bindMatchId}
                onChange={setBindMatchId}
                team={teamBinding}
                toggle={closeBindModal}
            />
            <div className="swiss-table">
                <div className="item-list-entry heading swiss">
                    <div className="team-no">No</div>
                    <div className="team-entry">Team</div>
                    <div className="team-series">Series</div>
                    <div className="team-rounds">Rounds</div>
                    <div className="team-rd">RD</div>
                    {
                        roundsLabels
                    }
                    <div className="options"></div>
                </div>
                {
                    [...Array(stage.teams)].map((_e: any, i) => (
                        <SwissEntry key={i} entry={entries[i] || null} index={i} setTeam={setTeam} rounds={stage.phases} matchups={stage.matchups} setBindMatchupId={setBindMatchupId} setBindOpen={setBindOpen}/>
                    ))
                }
            </div>
        </>
    )
}

export default Swiss;