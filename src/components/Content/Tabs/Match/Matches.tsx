import React, { Component } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Row, Button, Col } from 'reactstrap';
//import Match from './Match';
import MatchEdit from './EditMatch';
import uuidv4 from 'uuid/v4';

import { IContextData } from '../../../Context';

import goBack from './../../../../styles/goBack.png';
import { socket } from '../Live/Live';

class MatchRow extends Component<{
	match: I.Match;
	teams: I.Team[];
	cxt: IContextData;
	edit: Function;
	setCurrent: Function;
}> {
	delete = async () => {
		await api.match.delete(this.props.match.id);
		this.props.cxt.reload();
	};
	render() {
		const { match, teams, cxt } = this.props;
		const left = teams.filter(team => team._id === match.left.id)[0];
		const right = teams.filter(team => team._id === match.right.id)[0];
		return (
			<div className={`match_row ${match.current ? 'live' : ''}`}>
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
						<div className="name">{(left && left.name) || 'Team One'}</div>
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
						<div className="name">{(right && right.name) || 'Team Two'}</div>
					</div>
				</div>
				<div className="vetos"></div>
				<div className="options">
					<Button className="round-btn " onClick={this.delete}>
						Delete
					</Button>
					<Button
						className="round-btn lightblue-btn"
						id={`match_id_${match.id}`}
						onClick={() => this.props.edit(match)}
					>
						Edit
					</Button>
					<Button className="purple-btn round-btn" onClick={() => this.props.setCurrent()}>
						Set as current
					</Button>
				</div>
			</div>
		);
	}
}

export default class Matches extends Component<{ cxt: IContextData }, { match: I.Match | null; maps: string[] }> {
	constructor(props: { cxt: IContextData }) {
		super(props);
		this.state = {
			match: null,
			maps: []
		};
	}
	add = async () => {
		const newMatch: I.Match = {
			id: uuidv4(),
			current: false,
			left: { id: null, wins: 0 },
			right: { id: null, wins: 0 },
			matchType: 'bo1',
			vetos: []
		};

		for (let i = 0; i < 7; i++) {
			newMatch.vetos.push({
				teamId: '',
				mapName: '',
				side: 'NO',
				type: 'pick',
				mapEnd: false,
				reverseSide: false
			});
		}
		await api.match.add(newMatch);
		//await api.match.set(matches);
		this.props.cxt.reload();
	};

	edit = async (id: string, match: I.Match) => {
		await api.match.update(id, match);
		//lawait api.match.set(newMatches);
		this.props.cxt.reload();
	};

	startEdit = (match?: I.Match) => {
		this.setState({ match: match || null });
	};

	setCurrent = (id: string) => async () => {
		const { matches } = this.props.cxt;
		const match = matches.find(match => match.id === id);
		if (!match) return;
		match.current = true;
		await api.match.update(id, match);
		// await api.match.set(newMatches);
		this.props.cxt.reload();
	};

	async componentDidMount() {
		await this.props.cxt.reload();
		const maps = await api.match.getMaps();
		this.setState({ maps });
		socket.on('match', async (force?: boolean) => {
			const currentlyEditing = this.state.match;
			if (!force || !currentlyEditing || !currentlyEditing.id) return;
			await this.props.cxt.reload();
			const current = this.props.cxt.matches.filter(match => match.id === currentlyEditing.id)[0];
			if (!current) return;
			this.startEdit(current);
		});
	}

	render() {
		const { match, maps } = this.state;
		return (
			<React.Fragment>
				{match ? (
					<div className="tab-title-container">
						<img src={goBack} onClick={() => this.startEdit()} className="go-back-button" alt="Go back" />
						Edit match
					</div>
				) : (
					<div className="tab-title-container">Matches</div>
				)}
				<div className={`tab-content-container no-padding ${match ? 'full-scroll' : ''}`}>
					{match ? (
						<MatchEdit
							match={match}
							edit={this.edit}
							teams={this.props.cxt.teams}
							cxt={this.props.cxt}
							maps={maps}
						/>
					) : (
						<>
							<Row className="matches_container">
								{this.props.cxt.matches.map(match => (
									<MatchRow
										key={match.id}
										edit={this.startEdit}
										setCurrent={this.setCurrent(match.id)}
										match={match}
										teams={this.props.cxt.teams}
										cxt={this.props.cxt}
									/>
								))}
							</Row>
							<Row>
								<Col className="main-buttons-container">
									<Button onClick={this.add} color="primary">
										+Create New
									</Button>
								</Col>
							</Row>
						</>
					)}
				</div>
			</React.Fragment>
		);
	}
}
