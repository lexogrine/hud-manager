//import TeamEditModal from './TeamEditModal';
import * as I from './../../../../api/interfaces';
import { useState } from 'react';
import Swiss from './Brackets/Swiss';
import { IContextData } from '../../../Context';
import { useTranslation } from 'react-i18next';
import MatchEntry from '../Match/MatchEntry';
import api from '../../../../api/api';
import { filterMatches } from '../../../../utils';
import Elimination from './Brackets/Elimination';
import { hash } from '../../../../hash';
import isSvg from '../../../../isSvg';
import EditMatch from '../Match/EditMatch';
import LoadingButton from '../../../LoadingButton';

interface IProps {
	tournament: I.Tournament;
	close: () => void;
	edit: () => void;
	cxt: IContextData;
	setOnBackClick: I.HeaderHandler;
	maps: string[];
	remove: () => void;
}

type Tabs = 'overview' | 'group' | 'playoffs' | 'matches';

const Tab = ({ tab, active, setTab }: { tab: Tabs; active: Tabs; setTab: (tab: Tabs) => void }) => (
	<div className={`tournament-tab ${tab} ${tab === active ? 'active' : ''}`} onClick={() => setTab(tab)}>
		{tab}
	</div>
);

const Content = ({ tab, active, children }: { tab: Tabs; active: Tabs; children: any }) => {
	if (tab !== active) return null;
	return <>{children}</>;
};

const systemDescription = (system: I.TournamentTypes) => {
	if (system === 'swiss') {
		return 'Swiss';
	}
	return `${system.charAt(0).toUpperCase()}${system.slice(1)} Elimination`;
};

const Tournament = ({ tournament, cxt, edit, remove, maps, setOnBackClick, close }: IProps) => {
	const [tab, setTab] = useState<Tabs>('playoffs');
	const [matchTab, setMatchTab] = useState('current');

	const [match, setMatch] = useState<I.Match | null>(null);

	const { t } = useTranslation();

	const group = tournament.groups[0];

	const renderTab = (tab: string) => (
		<div className={`match-type-entry ${tab === matchTab ? 'active' : ''}`} onClick={() => setMatchTab(tab)}>
			{(tab && t('match.tabs.' + tab)) || ''}
		</div>
	);

	const editMatch = async (id: string, match: I.Match) => {
		await api.match.update(id, match);
		cxt.reload();
	};

	const stopEditing = () => {
		setMatch(null);
		setOnBackClick(close, 'Tournament page')
	}

	const startEditMatch = (match: I.Match | null) => {
		setMatch(match);
		setOnBackClick(stopEditing, 'Edit match');
	};

	const setCurrent = (id: string) => async () => {
		const { matches } = cxt;
		const match = matches.find(match => match.id === id);
		if (!match) return;
		match.current = !match.current;
		await api.match.update(id, match);
		// await api.match.set(newMatches);
		cxt.reload();
	};

	const matches = cxt.matches.filter(
		match =>
			tournament.playoffs.matchups.find(matchup => matchup.matchId === match.id) ||
			tournament.groups.find(group => group.matchups.find(matchup => matchup.matchId === match.id))
	);

	let tournamentTeams = `${tournament.playoffs.teams} Teams`;

	let tournamentSystem = systemDescription(tournament.playoffs.type);

	if (tournament.groups.length) {
		const amountOfTeamsInGroups = tournament.groups.map(group => group.teams).reduce((a, b) => a + b, 0);
		tournamentTeams = `${amountOfTeamsInGroups}/${tournamentTeams}`;
		tournamentSystem = `${systemDescription(
			tournament.groups[0].type
		)} (${amountOfTeamsInGroups} teams) then ${tournamentSystem}`;
	}

	let logo = '';
	if (tournament.logo) {
		if (tournament.logo.includes('api/players/avatar')) {
			logo = `${tournament.logo}?hash=${hash()}`;
		} else {
			logo = `data:image/${isSvg(Buffer.from(tournament.logo, 'base64')) ? 'svg+xml' : 'png'};base64,${
				tournament.logo
			}`;
		}
	}

	if (match) {
		return (
			<>
				<div className="tab-content-container">
					<EditMatch match={match} edit={editMatch} cxt={cxt} maps={maps} />
				</div>
				<div className="action-container">
					<LoadingButton className="button green strong big wide" onClick={() => setMatch(null)}>
						{t('common.cancel')}
					</LoadingButton>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="tab-content-container no-padding">
				<div className="tournament-info-header">
					<div className="tournament-logo">{logo ? <img src={logo} /> : null}</div>
					<div className="tournament-details">
						<div className="tournament-info">
							<div className="tournament-name">
								{tournament.name}
								<div className="button green strong big" onClick={edit}>
									Edit
								</div>
								<div className="button green strong big empty" onClick={remove}>
									Delete
								</div>
							</div>
							<div className="tournament-phases">
								<div className="tournament-teams">{tournamentTeams}</div>
								<div className="tournament-stages">{tournamentSystem}</div>
							</div>
						</div>
						<div className="tabs">
							<Tab tab="group" active={tab} setTab={setTab} />
							<Tab tab="playoffs" active={tab} setTab={setTab} />
							<Tab tab="matches" active={tab} setTab={setTab} />
						</div>
					</div>
				</div>
				<div className="tournament-content">
					<Content tab="group" active={tab}>
						{group ? <Swiss cxt={cxt} tournament={tournament} stage={group} /> : null}
					</Content>
					<Content tab="playoffs" active={tab}>
						<Elimination cxt={cxt} tournament={tournament} />
					</Content>
					<Content tab="matches" active={tab}>
						<div style={{ width: '100%' }}>
							<div className="match-type-menu">
								{renderTab('ended')}
								{renderTab('current')}
								{renderTab('future')}
							</div>
							<div className="item-list-entry heading matches">
								<div className="match-name">{t('match.columns.match')}</div>
								<div className="map-score">{t('match.columns.score')}</div>
								<div className="match-date">{t('match.columns.date')}</div>
								<div className="match-time">{t('match.columns.time')}</div>
								<div className="options"></div>
							</div>
							{matches
								.filter(match => filterMatches(match, matchTab))
								.map(match => (
									<MatchEntry
										key={match.id}
										edit={startEditMatch}
										setCurrent={setCurrent(match.id)}
										match={match}
										teams={cxt.teams}
										cxt={cxt}
									/>
								))}
						</div>
					</Content>
				</div>
			</div>
		</>
	);
};

export default Tournament;
