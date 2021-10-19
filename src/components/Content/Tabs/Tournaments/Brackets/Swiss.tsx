import { useState } from 'react';
import api, { maxWins } from '../../../../../api/api';
import { IContextData } from '../../../../Context';
import BindModal from '../BindModal';
import uuidv4 from 'uuid/v4';
import * as I from './../../../../../api/interfaces';

interface Props {
	tournament: I.Tournament;
	stage: I.TournamentStage;
	cxt: IContextData;
}

const isMatchFinished = (match: I.Match) => {
	const winsRequired = maxWins(match.matchType);

	return match.left.wins === winsRequired || match.right.wins === winsRequired;
};

const isTeamInMatch = (team: I.Team, match: I.Match) => match.left.id === team._id || match.right.id === team._id;

interface TeamsRound {
	opponent: I.Team | null;
	matchup: I.TournamentMatchup;
	match: I.Match | null;
	phase: number;
}

interface TeamInStage {
	team: I.Team;
	series: { wins: number; losses: number };
	points: { wins: number; losses: number };
	rounds: TeamsRound[];
}

interface MatchDrop {
	team: TeamInStage | null;
	opponentId: string | null;
	round: TeamsRound | null;
}

interface MatchDropOptions {
	team?: TeamInStage | null;
	opponentTarget?: HTMLElement | null;
	round?: TeamsRound | null;
}

const getTeamEntry = (team: I.Team, teams: I.Team[], matchesForTeam: I.Match[], stage: I.TournamentStage) => {
	const { matchups, phases } = stage;

	const entry = { team, rounds: [], series: { wins: 0, losses: 0 }, points: { wins: 0, losses: 0 } } as TeamInStage;

	const finishedMatches: I.Match[] = [];

	for (let i = 0; i < phases; i++) {
		let matchup = matchups.find(
			matchup => matchup.stage === i && matchesForTeam.find(match => match.id === matchup.matchId)
		);

		if (!matchup) {
			matchup = matchups.find(matchup => matchup.stage === i && !matchup.matchId);
		}
		if (!matchup) continue;

		const match = matchup.matchId
			? matchesForTeam.find(match => match.id === (matchup as I.TournamentMatchup).matchId) || null
			: null;

		let opponent: I.Team | null = null;

		if (match) {
			if (isMatchFinished(match)) finishedMatches.push(match);
			opponent =
				teams.find(opp => opp._id !== team._id && (match.left.id === opp._id || match.right.id === opp._id)) ||
				null;
		}

		entry.rounds.push({
			opponent,
			matchup,
			match,
			phase: i
		});
	}

	const seriesWins = finishedMatches.filter(match =>
		match.left.id === team._id ? match.left.wins > match.right.wins : match.right.wins > match.left.wins
	).length;
	const seriesLosses = finishedMatches.filter(match =>
		match.left.id !== team._id ? match.left.wins > match.right.wins : match.right.wins > match.left.wins
	).length;

	const scores = finishedMatches
		.map(match => match.vetos)
		.flat()
		.map(veto => veto.score)
		.filter(score => !!score) as I.VetoScore[];

	const pointWins = scores.map(score => Number(score[team._id]) || 0).reduce((a, b) => a + b, 0);
	const pointLosses = scores
		.map(score => {
			const opponentId = Object.keys(score).find(teamId => teamId !== team._id);
			if (!opponentId) return 0;
			return Number(score[opponentId]) || 0;
		})
		.reduce((a, b) => a + b, 0);

	entry.series.wins = seriesWins;
	entry.series.losses = seriesLosses;
	entry.points.wins = pointWins;
	entry.points.losses = pointLosses;

	return entry;
};

const sortTeams = (teams: I.Team[], matches: I.Match[], stage: I.TournamentStage) => {
	const participants = teams.filter(team => stage.participants.includes(team._id));

	const entries = participants.map(team =>
		getTeamEntry(
			team,
			teams,
			matches.filter(match => isTeamInMatch(team, match)),
			stage
		)
	);

	entries.sort((teamA, teamB) => {
		if (teamA.series.wins !== teamB.series.wins) return teamB.series.wins - teamA.series.wins;
		if (teamA.series.losses !== teamB.series.losses) return teamA.series.losses - teamB.series.losses;
		return teamB.points.wins - teamB.points.losses - (teamA.points.wins - teamA.points.losses);
	});

	return entries;
};

const getFirstEmptySlotIndex = (team?: TeamInStage | null) => {
	if (!team) return -1;
	for (let i = 0; i < team.rounds.length; i++) {
		const isEditable = !team.rounds[i] || !team.rounds[i].match;
		if (isEditable) {
			return i;
		}
	}
	return -1;
};

const RoundInfo = ({
	round,
	setBindMatchupId,
	setBindOpen,
	setTeam,
	showEdit,
	index,
	team,
	updateDropTarget,
	dropTarget
}: {
	showEdit?: boolean;
	round?: TeamsRound;
	setBindMatchupId: (id: string) => void;
	setBindOpen: (state: boolean) => void;
	setTeam: () => void;
	index: number;
	team: I.Team;
	dropTarget: MatchDrop;
	updateDropTarget: (info: MatchDropOptions) => void;
}) => {
	const startBinding = () => {
		if (!round || round.match) return;
		setTeam();
		setBindMatchupId(round?.matchup._id);
		setBindOpen(true);
	};

	if (!round) return null;

	const { match, opponent } = round;

	if (!match) {
		return showEdit ? (
			<div
				className={`result edit ${dropTarget.opponentId === team._id ? 'active' : ''} ${
					showEdit &&
					getFirstEmptySlotIndex(dropTarget.team) === index &&
					dropTarget.team &&
					dropTarget.team?.team._id !== team._id
						? 'available'
						: 'not-available'
				}`}
				onClick={startBinding}
				data-teamId={team._id}
				onDragLeave={e => {
					e.preventDefault();
					//setTimeout(() => updateDropTarget({ opponentTarget: null, round: null }), 51);
				}}
				onDragOver={e => {
					e.preventDefault();
					updateDropTarget({ opponentTarget: e.target as any, round });
				}}
			></div>
		) : null;
	}

	let winnerId = match.left.wins > match.right.wins ? match.left.id : match.right.id;

	if (maxWins(match.matchType) !== match.left.wins && maxWins(match.matchType) !== match.right.wins) {
		winnerId = null;
	}
	if (opponent) {
		return (
			<div className={`result ${winnerId === null ? 'ongoing' : winnerId === team._id ? 'win' : 'loss'}`}>
				{opponent.logo ? <img src={opponent.logo} className="team-logo" /> : null}
				{match.left.id === opponent._id ? match.right.wins : match.left.wins}:
				{match.left.id === opponent._id ? match.left.wins : match.right.wins}
			</div>
		);
	}

	return (
		<div className={`result ${winnerId === null ? 'ongoing' : winnerId === team._id ? 'win' : 'loss'}`}>
			{match.left.wins}:{match.right.wins}
		</div>
	);
};

const SwissEntry = ({
	entry,
	index,
	rounds,
	setBindMatchupId,
	setBindOpen,
	setTeam,
	matchups,
	tournament,
	dropTarget,
	updateDropTarget,
	cxt
}: {
	entry: TeamInStage | null;
	setBindMatchupId: (id: string) => void;
	setTeam: (id: string) => void;
	setBindOpen: (state: boolean) => void;
	index: number;
	rounds: number;
	tournament: I.Tournament;
	matchups: I.TournamentMatchup[];
	dropTarget: MatchDrop;
	updateDropTarget: (info: MatchDropOptions) => void;
	cxt: IContextData;
}) => {
	if (!entry) {
		const roundsLabels = [...Array(rounds)].map((_e: any, i) => (
			<div key={`round-${i}-${index}`} className="team-round"></div>
		));
		return (
			<div className="item-list-entry swiss">
				<div className="team-no">{index + 1}</div>
				<div className="team-entry"></div>
				<div className="team-series">0 - 0</div>
				<div className="team-rounds">0 - 0</div>
				<div className="team-rd">0</div>
				{roundsLabels}
				<div className="options"></div>
			</div>
		);
	}
	const roundsLabels = [...Array(rounds)].map((_e: any, i) => {
		const showEdit = !entry.rounds[i - 1] || !!entry.rounds[i - 1].match;
		return (
			<div key={`round-${i}-${index}`} className={`team-round `}>
				<RoundInfo
					showEdit={showEdit}
					setTeam={() => setTeam(entry.team._id)}
					round={entry.rounds[i]}
					team={entry.team}
					index={i}
					setBindMatchupId={setBindMatchupId}
					dropTarget={dropTarget}
					setBindOpen={setBindOpen}
					updateDropTarget={updateDropTarget}
				/>
			</div>
		);
	});

	const update = async () => {
		const { opponentId, round, team } = dropTarget;
		if (!opponentId || !round || !team) {
			updateDropTarget({ opponentTarget: null, round: null, team: null });
			return;
		}
		if (opponentId === team.team._id) {
			updateDropTarget({ opponentTarget: null, round: null, team: null });
			return;
		}
		const indexForTeam = getFirstEmptySlotIndex(team);
		const indexForOpponent = matchups.find(matchup => matchup._id === round.matchup._id)?.stage;

		if (indexForTeam !== indexForOpponent) {
			updateDropTarget({ opponentTarget: null, round: null, team: null });
			return;
		}
		updateDropTarget({ opponentTarget: null, round: null, team: null });
		const newMatch = {
			id: uuidv4(),
			current: false,
			left: { id: team.team._id, wins: 0 },
			right: { id: dropTarget.opponentId, wins: 0 },
			matchType: 'bo3',
			vetos: [],
			startTime: 0,
			game: 'csgo',
			matchupId: round.matchup._id,
			tournamentId: tournament._id
		} as I.Match;

		for (let i = 0; i < 9; i++) {
			newMatch.vetos.push({ teamId: '', mapName: '', side: 'NO', type: 'pick', mapEnd: false });
		}

		await api.match.add(newMatch);
		cxt.reload();
		return;
	};

	return (
		<div className="item-list-entry swiss">
			<div className="team-no">{index + 1}</div>
			<div
				className="team-entry"
				draggable="true"
				onDragStart={e => {
					e.stopPropagation();
					updateDropTarget({ team: entry, round: null, opponentTarget: null });
				}}
				onDragEnd={e => {
					e.stopPropagation();
					update();
				}}
			>
				{entry.team.name}
			</div>
			<div className="team-series">
				{entry.series.wins} - {entry.series.losses}
			</div>
			<div className="team-rounds">
				{entry.points.wins} - {entry.points.losses}
			</div>
			<div className="team-rd">{entry.points.wins - entry.points.losses}</div>
			{roundsLabels}
			<div className="options"></div>
		</div>
	);
};
const Swiss = ({ stage, tournament, cxt }: Props) => {
	const [dropTarget, setDropTarget] = useState<MatchDrop>({ team: null, opponentId: null, round: null });

	const [bindMatchId, setBindMatchId] = useState('');
	const [isBindOpen, setBindOpen] = useState(false);
	const [teamBinding, setTeam] = useState('');
	const [bindMatchupId, setBindMatchupId] = useState('');

	const updateDropTarget = (x: MatchDropOptions) => {
		const { team, opponentTarget, round } = x;
		const update = { ...dropTarget } as MatchDrop;

		if (opponentTarget) {
			const opponentId = opponentTarget.getAttribute('data-teamId');
			if (opponentId !== dropTarget.opponentId) {
				update.opponentId = opponentId;
			}
		} else if (opponentTarget === null) {
			update.opponentId = null;
		}
		if (team) {
			if (team !== dropTarget.team) {
				update.team = team;
			}
		} else if (team === null) {
			update.team = null;
		}
		if (round) {
			if (round !== dropTarget.round) {
				update.round = round;
			}
		} else if (round === null) {
			update.round = null;
		}

		setDropTarget(update);
	};

	const entries = sortTeams(cxt.teams, cxt.matches, stage);

	const roundsLabels = [...Array(stage.phases)].map((_e: any, i) => (
		<div key={`round-${i}`} className="team-round">
			Round {i + 1}
		</div>
	));

	const closeBindModal = () => {
		setBindOpen(false);
		setBindMatchId('');
		setBindMatchupId('');
	};

	const bind = async () => {
		if (!tournament) return;
		await api.tournaments.bind(tournament._id, bindMatchId, bindMatchupId);
		await cxt.reload();
		closeBindModal();
	};

	/*useEffect(() => {
		if(!dropTarget.opponentId || !dropTarget.round || !dropTarget.teamId) return;
		console.log(dropTarget)
	}, [dropTarget])*/

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
					{roundsLabels}
					<div className="options"></div>
				</div>
				{[...Array(stage.teams)].map((_e: any, i) => (
					<SwissEntry
						key={i}
						entry={entries[i] || null}
						index={i}
						setTeam={setTeam}
						rounds={stage.phases}
						matchups={stage.matchups}
						setBindMatchupId={setBindMatchupId}
						setBindOpen={setBindOpen}
						cxt={cxt}
						dropTarget={dropTarget}
						tournament={tournament}
						updateDropTarget={updateDropTarget}
					/>
				))}
			</div>
		</>
	);
};

export default Swiss;
