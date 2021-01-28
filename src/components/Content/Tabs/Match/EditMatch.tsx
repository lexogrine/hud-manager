import React, { Component } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import editIcon from './../../../../styles/EditIcon.png';
import TeamModal from './SetTeamModal';
import { socket } from '../Live/Live';

import { IContextData } from '../../../Context';
import { Form, Row, Col, FormGroup, Input } from 'reactstrap';
import SingleVeto from './SingleVeto';

/*class EditTeam extends Component {
    render() {
        return 
    }
}*/

const EditTeam = () => {
	return (
		<div className="edit-team-button">
			<img src={editIcon} alt={`Edit Team`} />
		</div>
	);
};

interface IProps {
	cxt: IContextData;
	match: I.Match;
	teams: I.Team[];
	edit: Function;
	maps: string[];
}

export default class MatchEdit extends Component<IProps, I.Match> {
	constructor(props: IProps) {
		super(props);
		this.state = this.props.match;
	}

	vetoHandler = (name: string, map: number) => (event: any) => {
		const { vetos }: any = this.state;
		const veto = { teamId: '', mapName: '', side: 'NO', ...vetos[map] };
		veto[name] = event.target.value;
		if (name === 'reverseSide') veto[name] = event.target.checked;
		if (veto.teamId === '' && veto.type !== 'decider') {
			veto.mapName = '';
		}
		if (veto.type === 'decider') {
			veto.side = 'NO';
		}
		vetos[map] = veto;
		this.setState({ vetos }, this.save);
	};
	changeMatchType = (event: any) => {
		const vetos: I.Veto[] = [];
		for (let i = 0; i < 7; i++) {
			vetos.push({ teamId: '', mapName: '', side: 'NO', type: 'pick', mapEnd: false });
		}
		this.setState({ matchType: event.target.value, vetos }, this.save);
	};
	getData = (side: 'right' | 'left', id: string, wins: number) => {
		const { state } = this;
		state[side].id = id;
		state[side].wins = wins || 0;
		this.setState(state, () => {
			this.save();
		});
	};

	save = async () => {
		const form = { ...this.state };
		if (form.id.length) {
			this.props.edit(form.id, form);
		}
	};
	async componentDidMount() {
		if (!this.state.id.length) return;
		socket.on('match', async (force?: boolean) => {
			if (!force) return;
			const matches = await api.match.get();
			const current = matches.filter(match => match.id === this.state.id)[0];
			if (!current) return;
			this.setState({ vetos: current.vetos });
		});
	}

	render() {
		const { match, teams, cxt } = this.props;
		const left = teams.filter(team => team._id === match.left.id)[0];
		const right = teams.filter(team => team._id === match.right.id)[0];
		const vetoTeams: I.Team[] = [];
		if (left) vetoTeams.push(left);
		if (right) vetoTeams.push(right);
		return (
			<>
				<div className={`match_row editing ${match.current ? 'live' : ''}`}>
					<div className="live-indicator">Live</div>
					<div className="main_data">
						<div className="left team">
							<div className="score">
								{match.left.wins}
								{left && left.logo ? (
									<img src={`${left.logo}?hash=${cxt.hash}`} alt={`${left.name} logo`} />
								) : (
									''
								)}
							</div>
							<div className="name">
								{(left && left.name) || 'Team One'}
								<TeamModal
									side="left"
									button={EditTeam()}
									teams={this.props.cxt.teams}
									team={this.state.left}
									onSave={this.getData}
								/>
							</div>
						</div>
						<div className="versus">VS</div>
						<div className="right team">
							<div className="score">
								{match.right.wins}
								{right && right.logo ? (
									<img src={`${right.logo}?hash=${cxt.hash}`} alt={`${right.name} logo`} />
								) : (
									''
								)}
							</div>
							<div className="name">
								{(right && right.name) || 'Team Two'}
								<TeamModal
									side="right"
									button={EditTeam()}
									teams={this.props.cxt.teams}
									team={this.state.right}
									onSave={this.getData}
								/>
							</div>
						</div>
					</div>
					<div className="vetos"></div>
				</div>
				<Form id="match_form">
					<Row>
						<Col md="12">
							<FormGroup>
								<Input
									type="select"
									id="matchType"
									name="matchType"
									onChange={this.changeMatchType}
									value={this.state.matchType}
								>
									<option value="bo1">BO1</option>
									<option value="bo2">BO2</option>
									<option value="bo3">BO3</option>
									<option value="bo5">BO5</option>
								</Input>
							</FormGroup>
						</Col>
					</Row>
					<Row>
						{this.state.vetos.map((veto, i) => (
							<SingleVeto
								vetoTeams={vetoTeams}
								key={i}
								map={i}
								maps={this.props.maps}
								onSave={this.vetoHandler}
								veto={veto}
								match={this.state}
							/>
						))}
					</Row>
				</Form>
			</>
		);
	}
}
