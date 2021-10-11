import { Form } from 'reactstrap';
import api, { maxWins } from './../../../../../api/api';
import * as I from './../../../../../api/interfaces';
import { IContextData } from './../../../../../components/Context';
import { TournamentMatchup, DepthTournamentMatchup } from '../../../../../../types/interfaces';
import BindModal from './../BindModal';
import { withTranslation } from 'react-i18next';
import { Component } from 'react';

const getMatchupsFromTournament = (tournament: I.Tournament) => [
	...tournament.playoffs.matchups,
	...tournament.groups.map(group => group.matchups).flat()
];

interface MatchData {
	left: { name: string; score: string | number; logo: string };
	right: { name: string; score: string | number; logo: string };
	type: I.BOTypes;
}
interface State {
	match: string;
	matchup: string;
	isOpen: boolean;
	isAdding: boolean;
}

class Tournaments extends Component<{ cxt: IContextData; t: any; tournament: I.Tournament }, State> {
	constructor(props: { cxt: IContextData; t: any; tournament: I.Tournament }) {
		super(props);
		this.state = {
			match: '',
			matchup: '',
			isOpen: false,
			isAdding: false
		};
	}

	bindHandler = (event: string) => {
		this.setState({ match: event });
	};

	joinParents = (matchup: TournamentMatchup, matchups: TournamentMatchup[]) => {
		const { tournament } = this.props;
		if (!tournament || !matchup) return matchup;

		if (matchup.parents.length) return matchup;

		const parents = matchups.filter(m => m.winner_to === matchup._id || m.loser_to === matchup._id);
		if (!parents.length) return matchup;
		matchup.parents.push(...parents.map(parent => this.joinParents(parent, matchups)));

		return matchup;
	};

	copyMatchups = (): DepthTournamentMatchup[] => {
		if (!this.props.tournament) return [];
		const matchups = JSON.parse(
			JSON.stringify(getMatchupsFromTournament(this.props.tournament))
		) as DepthTournamentMatchup[];
		return matchups;
	};

	setDepth = (matchups: DepthTournamentMatchup[], matchup: DepthTournamentMatchup, depth: number, force = false) => {
		const getParents = (matchup: DepthTournamentMatchup) => {
			return matchups.filter(parent => parent.loser_to === matchup._id || parent.winner_to === matchup._id);
		};

		if (!matchup.depth || force) {
			matchup.depth = depth;
			getParents(matchup).forEach(matchup => this.setDepth(matchups, matchup, depth + 1));
		}
		if (matchup.depth <= depth - 1) {
			this.setDepth(matchups, matchup, depth - 1, true);
		}
		return matchup;
	};

	getMatch = (matchup: TournamentMatchup) => {
		const { cxt } = this.props;
		const matchData: MatchData = {
			left: { name: 'TBD', score: '-', logo: '' },
			right: { name: 'TBD', score: '-', logo: '' },
			type: 'bo3'
		};
		const match = cxt.matches.find(match => match.id === matchup.matchId);
		if (!match) return matchData;
		matchData.type = match.matchType;
		const teams = [
			cxt.teams.find(team => team._id === match.left.id),
			cxt.teams.find(team => team._id === match.right.id)
		];
		if (teams[0]) {
			matchData.left.name = teams[0].name;
			matchData.left.score = match.left.wins;
			matchData.left.logo = teams[0].logo;
		}
		if (teams[1]) {
			matchData.right.name = teams[1].name;
			matchData.right.score = match.right.wins;
			matchData.right.logo = teams[1].logo;
		}
		return matchData;
	};

	save = async () => {
		const { matchup, match } = this.state;
		const { tournament } = this.props;
		if (!tournament) return;
		await api.tournaments.bind(tournament._id, match, matchup);
		this.props.cxt.reload();
		this.setState({ isOpen: false });
	};

	renderBracket = (
		matchup: DepthTournamentMatchup | null | undefined,
		depth: number,
		fromChildId: string | undefined,
		childVisibleParents: number,
		isLast = false
	) => {
		const { tournament } = this.props;
		if (!matchup || !tournament) return null;
		const match = this.getMatch(matchup);

		if (fromChildId === matchup.loser_to) return null;
		const parentsToRender = matchup.parents.filter(matchupParent => matchupParent.loser_to !== matchup._id);
		if (matchup.depth > depth) {
			return (
				<div className="empty-bracket">
					{this.renderBracket(matchup, depth + 1, fromChildId, parentsToRender.length)}
					<div className="connector"></div>
				</div>
			);
		}
		const winsRequired = maxWins(match.type);
		return (
			<div className={`bracket depth-${depth}`}>
				<div className="parent-brackets">
					{this.renderBracket(matchup.parents[0], depth + 1, matchup._id, parentsToRender.length)}
					{this.renderBracket(matchup.parents[1], depth + 1, matchup._id, parentsToRender.length)}
				</div>
				<div className="bracket-details">
					<div
						className={`match-connector ${
							!matchup.parents.length || parentsToRender.length === 0 ? 'first-match' : ''
						} ${isLast ? 'last-match' : ''}`}
					></div>
					{parentsToRender.length === 1 ? <div className="loser-parent-indicator"></div> : null}
					<div className="match-details" onClick={this.openModal(matchup._id, matchup.matchId || '')}>
						<div className="team-data">
							<div className="team-logo">
								{match.left.logo ? (
									<img src={`${match.left.logo}?hash=${this.props.cxt.hash}`} alt="Logo" />
								) : null}
							</div>
							<div className="team-name">{match.left.name}</div>
							<div className={`team-score ${match.left.score === winsRequired ? 'win' : ''}`}>
								{match.left.score}
							</div>
						</div>
						<div className="team-data">
							<div className="team-logo">
								{match.right.logo ? (
									<img src={`${match.right.logo}?hash=${this.props.cxt.hash}`} alt="Logo" />
								) : null}
							</div>
							<div className="team-name">{match.right.name}</div>
							<div className={`team-score ${match.right.score === winsRequired ? 'win' : ''}`}>
								{match.right.score}
							</div>
						</div>
					</div>
				</div>

				{childVisibleParents === 2 ? (
					<div className={`connector amount-${parentsToRender.length}`}></div>
				) : null}
			</div>
		);
	};

	renderLadder = () => {
		const { tournament } = this.props;
		if (!tournament) return null;
		const matchups = this.copyMatchups();
		const gf = matchups.find(matchup => matchup.winner_to === null);
		if (!gf) return null;
		const joinedParents = this.joinParents(gf, matchups);
		const matchupWithDepth = this.setDepth(matchups, joinedParents as DepthTournamentMatchup, 0);
		return this.renderBracket(matchupWithDepth, 0, undefined, 2, true);
	};

	toggleModal = () => {
		this.setState({ isOpen: !this.state.isOpen });
	};

	openModal = (matchup: string, match: string) => () => {
		this.setState({ matchup, match, isOpen: true });
	};

	render() {
		const { match, isOpen } = this.state;
		const { cxt } = this.props;
		return (
			<Form>
				<div className="tab-content-container">
					<BindModal
						save={this.save}
						teams={cxt.teams}
						matches={cxt.matches}
						isOpen={isOpen}
						matchId={match}
						onChange={this.bindHandler}
						toggle={this.toggleModal}
					/>
					<div className="ladder-view" style={{ height: '500px' }}>
						{this.renderLadder()}
					</div>
				</div>
			</Form>
		);
	}
}
export default withTranslation()(Tournaments);
