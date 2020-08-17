import React from 'react';
import { Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import VetoModal from './VetoModal';
import EditScoreModal from './EditScoreModal';

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
}
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
	let scoreDescription = '';
	let winnerDescription = '';
	if (secTeam && secTeam.name && veto.side !== 'NO') {
		sidePick = `, ${secTeam.name} chooses ${veto.side} side`;
	}
	if (veto.type === 'decider') {
		text = null;
		sidePick = `${veto.mapName} decider`;
	}
	if (veto.score && Number.isInteger(veto.score[team._id]) && Number.isInteger(veto.score[secTeam._id])) {
		scoreDescription = `${team.shortName} ${veto.score[team._id]}:${veto.score[secTeam._id]} ${secTeam.shortName}`;
	}

	if (veto.mapEnd && veto.winner) {
		if (team && team._id === veto.winner) {
			winnerDescription += `${team.name} wins`;
		} else if (secTeam && secTeam._id === veto.winner) {
			winnerDescription += `${secTeam.name} wins`;
		}
	}

	return (
		<>
			<div>
				{text} {sidePick || null}
			</div>
			{scoreDescription ? <div>{scoreDescription}</div> : null}
			{winnerDescription ? <div>{winnerDescription}</div> : null}
		</>
	);
}

class SingleVeto extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			isOpen: false,
			isScoreOpen: false
		};
	}
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
							<div className="veto-title">VETO {map + 1}:</div>
							<div className="veto-summary">{generateDescription(veto, team, secTeam)}</div>
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
