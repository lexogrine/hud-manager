import React, { Component } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Row, Button, Col } from 'reactstrap';
//import Match from './Match';
import MatchEdit from './EditMatch';
import MatchEntry from './MatchEntry';
import uuidv4 from 'uuid/v4';

import { IContextData } from '../../../Context';

import goBack from './../../../../styles/goBack.png';
import { socket } from '../Live/Live';
import moment from 'moment';

export default class Matches extends Component<
	{ cxt: IContextData },
	{ match: I.Match | null; maps: string[]; activeTab: string }
> {
	constructor(props: { cxt: IContextData }) {
		super(props);
		this.state = {
			match: null,
			maps: [],
			activeTab: 'current'
		};
	}
	add = async () => {
		const newMatch: I.Match = {
			id: uuidv4(),
			current: false,
			left: { id: null, wins: 0 },
			right: { id: null, wins: 0 },
			matchType: 'bo1',
			vetos: [],
			startTime: 0
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

	handleTabToggle = (activeTab: string) => () => {
		this.setState({ activeTab });
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

	renderTab = (tab: string) => (
		<div
			className={`match-type-entry ${tab === this.state.activeTab ? 'active' : ''}`}
			onClick={() => this.setState({ activeTab: tab })}
		>
			{tab}
		</div>
	);

	filterMatches = (match: I.Match) => {
		const boToWinsMap = {
			1: 1,
			3: 2,
			5: 3
		};
		const { activeTab } = this.state;
		const picks = match.vetos.filter(veto => veto.type !== 'ban');
		let isEnded = false;
		const bo = parseInt(match.matchType.replace('bo', '')) as 1 | 2 | 3 | 5;

		if (bo === 2) {
			isEnded = picks.filter(pick => pick.mapEnd).length === 2 || match.left.wins + match.right.wins >= 2;
		} else {
			isEnded = match.left.wins === boToWinsMap[bo] || match.right.wins === boToWinsMap[bo];
		}
		if (activeTab === 'ended') {
			return isEnded;
		}
		if (isEnded) {
			return false;
		}

		const isInFuture = match.startTime && moment(match.startTime).isAfter(moment(), 'day');

		return isInFuture === (activeTab === 'future');
	};

	render() {
		const { matches } = this.props.cxt;
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
							<div className="match-type-menu">
								{this.renderTab('ended')}
								{this.renderTab('current')}
								{this.renderTab('future')}
							</div>
							<div className="item-list-entry heading matches">
								<div className="match-name">Match</div>
								<div className="map-score">Score</div>
								<div className="match-date">Date</div>
								<div className="match-time">Time</div>
								<div className="options"></div>
							</div>
							{matches.filter(this.filterMatches).map(match => (
								<MatchEntry
									key={match.id}
									edit={this.startEdit}
									setCurrent={this.setCurrent(match.id)}
									match={match}
									teams={this.props.cxt.teams}
									cxt={this.props.cxt}
								/>
							))}
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
