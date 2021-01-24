import React from 'react';
import { Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import VetoModal from './VetoModal';
import EditScoreModal from './EditScoreModal';
import { hash } from '../../../../hash';

interface Props {
	map: number;
	veto: I.Veto;
	vetoTeams: I.Team[];
	match: I.Match;
	onSave: (name: string, map: number) => any;
	maps: string[];
}
interface State {
	isOpen: boolean;
	isScoreOpen: boolean;
	isMenuExpanded: boolean;
}
const VetoScore = ({ veto, left, right }: { veto: I.Veto; left: I.Team | null; right: I.Team | null }) => {
	if (!left || !right || !veto.score) return null;
	return (
		<div className="veto-score">
			<div className={`win-icon ${veto.winner === left._id ? 'active' : ''}`}>WINS</div>

			{left.logo ? (
				<img src={`${left.logo}?hash=${hash()}`} alt={`${left.name} logo`} className="team-logo" />
			) : (
				''
			)}
			<div className="score">{veto.score[left._id] || 0}</div>
			<div className="versus">VS</div>
			<div className="score">{veto.score[right._id] || 0}</div>
			{right.logo ? (
				<img src={`${right.logo}?hash=${hash()}`} alt={`${right.name} logo`} className="team-logo" />
			) : (
				''
			)}
			<div className={`win-icon ${veto.winner === right._id ? 'active' : ''}`}>WINS</div>
		</div>
	);
};
function generateDescription(veto: I.Veto, team?: I.Team, secTeam?: I.Team) {
	if (!veto.mapName) {
		return '';
	}
	if (veto.type === 'decider') {
		//return `${veto.mapName} decider`;
	}
	if (!team || !team.name || !secTeam) {
		return <strong>Wrong team selected</strong>;
	}
	let text: string | null = `${team.name} ${veto.type}s ${veto.mapName}`;
	let sidePick = '';
	if (secTeam && secTeam.name && veto.side !== 'NO') {
		sidePick = `, ${secTeam.name} chooses ${veto.side} side`;
	}
	if (veto.type === 'decider') {
		text = null;
		sidePick = `${veto.mapName} decider`;
	}
	return (
		<div>
			{text} {sidePick || null}
		</div>
	);
}

class SingleVeto extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			isOpen: false,
			isScoreOpen: false,
			isMenuExpanded: false
		};
	}
	toggleMenu = () => {
		this.setState({ isMenuExpanded: !this.state.isMenuExpanded });
	};
	toggleScoreOpen = () => {
		this.setState({ isScoreOpen: !this.state.isScoreOpen });
	};
	toggle = () => {
		this.setState({ isOpen: !this.state.isOpen });
	};
	resetScore = () => {
		this.props.onSave('winner', this.props.map)({ target: { value: undefined } });
		this.props.onSave('mapEnd', this.props.map)({ target: { value: false } });
		this.props.onSave('score', this.props.map)({ target: { value: {} } });
	};
	setScore = (teamId: string, score: number) => () => {
		const { veto, vetoTeams } = this.props;
		let scores: { [key: string]: number } = {};
		if (veto.score) {
			scores = veto.score;
		}
		if (!scores[vetoTeams[0]._id]) scores[vetoTeams[0]._id] = 0;
		if (!scores[vetoTeams[1]._id]) scores[vetoTeams[1]._id] = 0;
		if (score < 0) score = 0;
		scores[teamId] = score;
		this.props.onSave('score', this.props.map)({ target: { value: scores } });
	};
	setWinner = (team?: string) => () => {
		this.props.onSave('winner', this.props.map)({ target: { value: team } });
		this.props.onSave('mapEnd', this.props.map)({ target: { value: !!team } });
	};
	componentDidMount() {}
	render() {
		const { vetoTeams, veto, map, maps, onSave } = this.props;
		const { isMenuExpanded } = this.state;
		let team = vetoTeams.filter(team => team._id === veto.teamId)[0];
		let secTeam = vetoTeams.filter(team => team._id !== veto.teamId)[0];
		if (!veto.teamId) {
			team = vetoTeams[0];
			secTeam = vetoTeams[1];
		}
		return (
			<div className={`veto-container ${veto.teamId === '' ? 'empty' : ''} ${veto.teamId ? veto.type : ''}`}>
				{vetoTeams.length !== 2 ? (
					'Pick both teams to set vetos'
				) : (
					<>
						<div className="veto-main">
							<div className="veto-description">
								<div
									className={`veto-title ${
										isMenuExpanded && team && secTeam && veto.score ? 'hide' : ''
									}`}
								>
									VETO {map + 1}:
								</div>
								<div
									className={`veto-summary ${
										isMenuExpanded && team && secTeam && veto.score ? 'hide' : ''
									}`}
								>
									{generateDescription(veto, team, secTeam)}
								</div>
							</div>
							<VetoScore veto={veto} left={team} right={secTeam} />
							{veto.mapName ? (
								<div
									className={`preview ${veto.mapName.replace('de_', '')} ${veto.type}`}
									onClick={this.toggle}
								>
									{veto.mapName.replace('de_', '')}
								</div>
							) : null}
							<div className={`veto-menu-container ${isMenuExpanded ? 'expanded' : 'collapsed'}`}>
								<div className={`veto-menu`}>
									<div className="toggler" onClick={this.toggleMenu}></div>
									<Button onClick={this.resetScore} className="edit-veto purple-btn">
										Reset score
									</Button>
									{veto.mapName ? (
										<Button onClick={this.toggleScoreOpen} className="edit-veto purple-btn">
											Set score
										</Button>
									) : null}
									<Button onClick={this.toggle} className="edit-veto purple-btn">
										Edit
									</Button>
								</div>
							</div>
						</div>
						{veto.mapName ? (
							<EditScoreModal
								setWinner={this.setWinner}
								teams={vetoTeams}
								toggle={this.toggleScoreOpen}
								isOpen={this.state.isScoreOpen}
								veto={veto}
								saveScore={this.setScore}
							/>
						) : null}
						<VetoModal
							maps={maps}
							map={map}
							veto={veto}
							teams={vetoTeams}
							isOpen={this.state.isOpen}
							toggle={this.toggle}
							onChange={onSave}
						/>
					</>
				)}
			</div>
		);
	}
}

export default SingleVeto;
