import { Component } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
//import Match from './Match';
import MatchEdit from './EditMatch';
import MatchEntry from './MatchEntry';
import uuidv4 from 'uuid/v4';

import { IContextData } from '../../../Context';

// import goBack from './../../../../styles/goBack.png';
import { socket } from '../Live/Live';
import { withTranslation } from 'react-i18next';
import { filterMatches } from '../../../../utils';
import LoadingButton from '../../../LoadingButton';

interface IProps {
	cxt: IContextData;
	t: any;
	maps: string[];
	setOnBackClick: I.HeaderHandler;
}

class Matches extends Component<IProps, { match: I.Match | null; activeTab: string }> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			match: null,
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
			startTime: 0,
			game: this.props.cxt.game
		};

		const vetos = {
			dota2: [] as I.Dota2Veto[],
			csgo: [] as I.CSGOVeto[],
			rocketleague: [] as I.RocketLeagueVeto[]
		};
		for (let i = 0; i < 9; i++) {
			vetos.csgo.push({ teamId: '', mapName: '', side: 'NO', type: 'pick', mapEnd: false });
			vetos.dota2.push({ mapEnd: false });
			vetos.rocketleague.push({ mapEnd: false });
		}
		switch (newMatch.game) {
			case 'csgo':
				newMatch.vetos = vetos.csgo;
				break;
			case 'rocketleague':
				newMatch.vetos = vetos.rocketleague;
				break;
			case 'dota2':
				newMatch.vetos = vetos.dota2;
				break;
		}
		await api.match.add(newMatch);
		//await api.match.set(matches);
		await this.props.cxt.reload();
		this.setState({ activeTab: 'current' });
	};

	edit = async (id: string, match: I.Match) => {
		await api.match.update(id, match);
		this.props.cxt.reload();
	};

	handleTabToggle = (activeTab: string) => () => {
		this.setState({ activeTab });
	};

	startEdit = (match?: I.Match) => {
		this.setState({ match: match || null }, () => {
			this.props.setOnBackClick(
				match
					? () => {
							this.startEdit();
					  }
					: null,
				match ? 'Edit match' : null
			);
		});
	};

	setCurrent = (id: string) => async () => {
		const { matches } = this.props.cxt;
		const match = matches.find(match => match.id === id);
		if (!match) return;
		match.current = !match.current;
		await api.match.update(id, match);
		// await api.match.set(newMatches);
		this.props.cxt.reload();
	};

	async componentDidMount() {
		await this.props.cxt.reload();
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
			{(tab && this.props.t('match.tabs.' + tab)) || ''}
		</div>
	);

	render() {
		const { matches } = this.props.cxt;
		const t = this.props.t;
		const { match } = this.state;
		return (
			<>
				{/*match ? (
					<div className="tab-title-container">
						<img
							src={goBack}
							onClick={() => this.startEdit()}
							className="go-back-button"
							alt={t('common.goBack')}
						/>
						{t('match.edit')}
					</div>
				) : (
					<div className="tab-title-container">{t('match.matches')}</div>
				)*/}
				<div className="tab-content-container no-padding">
					{match ? (
						<MatchEdit match={match} edit={this.edit} cxt={this.props.cxt} maps={this.props.maps} />
					) : (
						<>
							<div className="match-type-menu">
								{this.renderTab('ended')}
								{this.renderTab('current')}
								{this.renderTab('future')}
							</div>
							<div className="item-list-entry heading matches">
								<div className="match-name">{t('match.columns.match')}</div>
								<div className="map-score">{t('match.columns.score')}</div>
								<div className="match-date">{t('match.columns.date')}</div>
								<div className="match-time">{t('match.columns.time')}</div>
								<div className="options"></div>
							</div>
							{matches
								.filter(match => filterMatches(match, this.state.activeTab))
								.map(match => (
									<MatchEntry
										key={match.id}
										edit={this.startEdit}
										setCurrent={this.setCurrent(match.id)}
										match={match}
										teams={this.props.cxt.teams}
										cxt={this.props.cxt}
									/>
								))}
						</>
					)}
				</div>
				<div className="action-container">
					<LoadingButton
						className="button green strong big wide"
						onClick={!match ? this.add : () => this.startEdit()}
					>
						{!match ? t('common.createNew') : t('common.cancel')}
					</LoadingButton>
				</div>
			</>
		);
	}
}

export default withTranslation()(Matches);
