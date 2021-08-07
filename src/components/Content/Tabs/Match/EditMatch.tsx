import { useEffect, useState } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import editIcon from './../../../../styles/EditIcon.png';
import TeamModal from './SetTeamModal';
import { socket } from '../Live/Live';

import { IContextData } from '../../../Context';
import { Form, Row, Col, FormGroup, Input } from 'reactstrap';
import moment from 'moment';
import VetoEntry from './VetoEntry';
import { useTranslation } from 'react-i18next';

const EditTeam = (t: any) => {
	return (
		<div className="edit-team-button">
			<img src={editIcon} alt={t('match.editTeam')} />
		</div>
	);
};

interface TeamScoreProps {
	cxt: IContextData;
	team: I.Team | null;
	teamState: I.MatchTeam;
	side: 'left' | 'right';
	onSave: any;
	t: any;
}

const TeamScore = ({ cxt, team, onSave, teamState, side, t }: TeamScoreProps) => {
	return (
		<div className={`${side} team`}>
			<div className="score">
				{teamState.wins}
				{team && team.logo ? <img src={`${team.logo}?hash=${cxt.hash}`} alt={`${team.name} logo`} /> : ''}
			</div>
			<div className="name">
				{(team && team.name) || t('common.teamOne')}
				<TeamModal side={side} button={EditTeam(t)} teams={cxt.teams} team={teamState} onSave={onSave} />
			</div>
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

const EditMatch = ({ cxt, match, teams, edit, maps }: IProps) => {
	const [matchState, setMatchState] = useState(match);

	const { t } = useTranslation();

	const save = async () => {
		const form = { ...matchState };
		if (form.id.length) {
			edit(form.id, form);
		}
	};

	const vetoHandler = (name: string, map: number, value: any) => {
		const { vetos }: any = matchState;
		const veto = { teamId: '', mapName: '', side: 'NO', ...vetos[map] };
		veto[name] = value;
		if (veto.teamId === '' && veto.type !== 'decider') {
			veto.mapName = '';
		}
		if (veto.type === 'decider') {
			veto.side = 'NO';
		}
		vetos[map] = veto;
		setMatchState({ ...matchState, vetos });
	};
	const changeMatchType = (event: any) => {
		const vetos: I.Veto[] = [];
		for (let i = 0; i < 9; i++) {
			vetos.push({ teamId: '', mapName: '', side: 'NO', type: 'pick', mapEnd: false });
		}
		setMatchState({ ...matchState, matchType: event.target.value, vetos });
	};
	const changeStartTime = (ev: any) => {
		const val = ev.target.value;
		setMatchState({ ...matchState, startTime: moment(val).valueOf() });
	};
	const getData = (side: 'right' | 'left', id: string, wins: number) => {
		setMatchState(prevMatchState => {
			prevMatchState[side].id = id;
			prevMatchState[side].wins = wins || 0;
			return { ...prevMatchState };
		});
	};
	useEffect(() => {
		const initiateSocket = async () => {
			if (!matchState.id.length) return;
			socket.on('match', async (force?: boolean) => {
				if (!force) return;
				const matches = await api.match.get();
				const current = matches.find(match => match.id === matchState.id);
				if (!current) return;
				setMatchState({ ...current });
			});
		};
		initiateSocket();
	}, []);

	useEffect(() => {
		save();
	}, [matchState]);

	const left = teams.find(team => team._id === match.left.id) || null;
	const right = teams.find(team => team._id === match.right.id) || null;
	const vetoTeams: I.Team[] = [];
	if (left) vetoTeams.push(left);
	if (right) vetoTeams.push(right);

	return (
		<>
			<div className={`match_row editing ${match.current ? 'live' : ''}`}>
				<div className="live-indicator">{t('match.live')}</div>
				<div className="main_data">
					<TeamScore cxt={cxt} side="left" team={left} teamState={matchState.left} onSave={getData} t={t} />
					<div className="versus">{t('common.vs')}</div>
					<TeamScore
						cxt={cxt}
						side="right"
						team={right}
						teamState={matchState.right}
						onSave={getData}
						t={t}
					/>
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
								onChange={changeMatchType}
								value={matchState.matchType}
							>
								<option value="bo1">BO1</option>
								<option value="bo2">BO2</option>
								<option value="bo3">BO3</option>
								<option value="bo5">BO5</option>
								<option value="bo7">BO7</option>
								<option value="bo9">BO9</option>
							</Input>
						</FormGroup>
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input
								type="datetime-local"
								value={
									matchState.startTime
										? moment(matchState.startTime).format(moment.HTML5_FMT.DATETIME_LOCAL)
										: ''
								}
								onChange={changeStartTime}
							/>
						</FormGroup>
					</Col>
				</Row>
				<Row>
					{matchState.vetos.map((veto, i) => (
						<VetoEntry
							vetoTeams={vetoTeams}
							key={i}
							map={i}
							maps={maps}
							onSave={vetoHandler}
							veto={veto}
							match={matchState}
						/>
					))}
				</Row>
			</Form>
		</>
	);
};
export default EditMatch;
