import React, { useState, useEffect } from 'react';
import Section from '../Section';
import { Row, Col, FormGroup, Input, Button, Label } from 'reactstrap';
import { IContextData } from '../../../../Context';
import { useTranslation } from 'react-i18next';
import api from '../../../../../api/api';
import * as I from './../../../../../api/interfaces';
import moment from 'moment';
import { Orientation, Side } from 'csgogsi-socket';

interface Props {
	cxt: IContextData;
}

export const MatchHandler: {
	edit: (match: I.Match | null) => void;
	match: I.Match | null;
	handler: (match: I.Match | null) => void;
} = {
	handler: () => {},
	match: null,
	edit: (match: I.Match | null) => {
		if (match && MatchHandler.match && match.id === MatchHandler.match.id) {
			MatchHandler.match = null;
			MatchHandler.handler(null);
			return;
		}
		MatchHandler.match = match;
		MatchHandler.handler(match);
	}
};

const CurrentMatchForm = ({ cxt }: Props) => {
	const { t } = useTranslation();
	const [maps, setMaps] = useState<string[]>([]);

	const [match, setMatch] = useState<I.Match | null>(null);

	const updateMatch = async () => {
		if (!match) return;
		const form = { ...match };
		if (form.id.length) {
			await api.match.update(form.id, form);
			cxt.reload();
		}
	};

	const setTeamHandler = (side: Orientation, id: string, wins = 0) => {
		if (!match) return;
		match[side].id = id;
		match[side].wins = wins;
		setMatch({ ...match });
	};

	const setVetoType = (veto: I.Veto, type: I.VetoType) => {
		if (!match) return;
		const newVetos = match.vetos.map(oldVeto => {
			if (veto !== oldVeto) return oldVeto;

			return { ...veto, type, teamId: type !== 'decider' ? veto.teamId : '' };
		});
		setMatch({ ...match, vetos: newVetos });
	};

	const setTeamForVeto = (index: number, teamId: string) => {
		if (!match) return;
		match.vetos = match.vetos.map((veto, i) => {
			if (index !== i) return veto;
			return { ...veto, teamId: teamId !== veto.teamId && veto.type !== 'decider' ? teamId : '' };
		});
		setMatch({ ...match });
	};

	const setMap = (veto: I.Veto, map: string) => {
		if (!match) return;
		const newVetos = match.vetos.map(oldVeto => {
			if (veto !== oldVeto) return oldVeto;

			return { ...veto, mapName: map };
		});
		setMatch({ ...match, vetos: newVetos });
	};

	const swapTeams = () => {
		if (!match) return;
		[match.left.id, match.right.id] = [match.right.id, match.left.id];
		setMatch({ ...match });
	};

	const changeStartTime = (ev: any) => {
		if (!match) return;
		const val = ev.target.value;
		setMatch({ ...match, startTime: moment(val).valueOf() });
	};

	const setReversed = (veto: I.Veto, checked: boolean) => {
		if (!match) return;
		const newVetos = match.vetos.map(oldVeto => {
			if (veto !== oldVeto) return oldVeto;

			return { ...veto, reverseSide: checked };
		});
		setMatch({ ...match, vetos: newVetos });
	};

	const setSidePick = (veto: I.Veto, side: Side | 'NO') => {
		if (!match) return;
		const newVetos = match.vetos.map(oldVeto => {
			if (veto !== oldVeto) return oldVeto;

			return { ...veto, side };
		});
		setMatch({ ...match, vetos: newVetos });
	};

	const setCurrent = async () => {
		if(!match) return;
		setMatch({ ...match, current: !match.current });
	};

	useEffect(() => {
		api.match.getMaps().then(maps => {
			setMaps(maps);
		});
		MatchHandler.handler = setMatch;
	}, []);

	useEffect(() => {
		updateMatch();
	}, [match]);

	const teams: I.Team[] = [];

	if (match) {
		//for (const veto of match.vetos) {
		//const index = match.vetos.indexOf(veto);

		/*if (!veto.mapName) {
				match.vetos[index] = {
					teamId: '',
					mapName: '',
					side: 'NO',
					mapEnd: false,
					type: 'pick'
				};
			}*/
		//}

		if (match.left.id) {
			const leftTeam = cxt.teams.find(team => team._id === match.left.id);
			if (leftTeam) teams.push(leftTeam);
		}

		if (match.right.id) {
			const rightTeam = cxt.teams.find(team => team._id === match.right.id);
			if (rightTeam) teams.push(rightTeam);
		}
	}
	return (
		<Section title={
			<>
				Match
				
				{ match ? <div className={`match-edit-button`} onClick={setCurrent}>
					<div className={`record-icon  ${match.current ? 'current':''}`} />
				</div> : null }
			</>} cxt={cxt} width={450}>
			{match ? (
				<>
					<Row>
						<Col md="5">
							<FormGroup>
								<Input
									type="select"
									name="team"
									value={match.left.id || ''}
									onChange={e => setTeamHandler('left', e.target.value)}
								>
									<option value="">{t('common.team')}</option>
									{cxt.teams
										.concat()
										.sort((a, b) => (a.name < b.name ? -1 : 1))
										.map(team => (
											<option key={team._id + 'cg'} value={team._id}>
												{team.name}
											</option>
										))}
								</Input>
							</FormGroup>
						</Col>
						<Col md="2" className="swap-container">
							<Button className="swap-btn picker-button" onClick={swapTeams}>
								Swap
							</Button>
						</Col>
						<Col md="5">
							<FormGroup>
								<Input
									type="select"
									name="team"
									value={match.right.id || ''}
									onChange={e => setTeamHandler('right', e.target.value)}
								>
									<option value="">{t('common.team')}</option>
									{cxt.teams
										.concat()
										.sort((a, b) => (a.name < b.name ? -1 : 1))
										.map(team => (
											<option key={team._id + 'cg'} value={team._id}>
												{team.name}
											</option>
										))}
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
										match.startTime
											? moment(match.startTime).format(moment.HTML5_FMT.DATETIME_LOCAL)
											: ''
									}
									onChange={changeStartTime}
								/>
							</FormGroup>
						</Col>
					</Row>
					{teams.length !== 2
						? t('match.pickBothTeams')
						: match.vetos.map((veto, i) => (
								<div key={veto.mapName + veto.teamId + i} className="veto-list">
									<Row>
										<Col md="5" className="team-picker-container">
											{teams.map((team, j) => (
												<div
													key={team._id + j + i}
													className={`picker-button ${
														veto.teamId === team._id ? 'active' : ''
													}`}
													onClick={() => setTeamForVeto(i, team._id)}
												>
													{team.logo ? <img src={team.logo} /> : null}{team.name}
												</div>
											))}
										</Col>
										{/*<Col md="5" className="team-picker-container">
                                <FormGroup>
                                    <Input type="select" name="team" value={veto.teamId || undefined}>
                                        <option value="">{t('common.team')}</option>
                                        {cxt.teams
                                            .concat()
                                            .sort((a, b) => (a.name < b.name ? -1 : 1))
                                            .map(team => (
                                                <option key={team._id} value={team._id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                    </Input>
                                </FormGroup>
                                            </Col>*/}
										<Col md="2" className="picker-container">
											<div
												className={`picker-button pick ${veto.type === 'pick' ? 'active' : ''}`}
												onClick={() => setVetoType(veto, 'pick')}
											>
												PICK
											</div>
											<div
												className={`picker-button ban ${veto.type === 'ban' ? 'active' : ''}`}
												onClick={() => setVetoType(veto, 'ban')}
											>
												BAN
											</div>
											<div
												className={`picker-button decider ${veto.type === 'decider' ? 'active' : ''}`}
												onClick={() => setVetoType(veto, 'decider')}
											>
												DECIDER
											</div>
										</Col>
										<Col md="5" className="map-picker-container">
											<FormGroup>
												<Input
													type="select"
													name="maps"
													value={veto.mapName || undefined}
													onChange={e => setMap(veto, e.target.value)}
												>
													<option value="">{t('common.map')}</option>
													{maps.map(map => (
														<option key={map} value={map}>
															{map}
														</option>
													))}
												</Input>
											</FormGroup>
										</Col>
									</Row>
									<Row>
										<Col s={12} className="side-picker">
											<div
												className={`picker-button CT ${veto.side === 'CT' ? 'active' : ''}`}
												onClick={() => setSidePick(veto, 'CT')}
											>
												{t('common.ct')}
											</div>
											<div
												className={`picker-button T ${veto.side === 'T' ? 'active' : ''}`}
												onClick={() => setSidePick(veto, 'T')}
											>
												{t('common.t')}
											</div>
											<div
												className={`picker-button NO ${veto.side === 'NO' ? 'active' : ''}`}
												onClick={() => setSidePick(veto, 'NO')}
											>
												{t('common.no')}
											</div>
										</Col>
									</Row>
									<Row>
										<Col s={12} className="side-reverse">
											<FormGroup check>
												<Label check>
													<Input
														type="checkbox"
														onChange={e => setReversed(veto, e.target.checked)}
														checked={veto.reverseSide || false}
													/>{' '}
													<div className="customCheckbox"></div>
													{t('match.reversedSides')}
												</Label>
											</FormGroup>
										</Col>
									</Row>
								</div>
						  ))}
				</>
			) : null}
		</Section>
	);
};

export default CurrentMatchForm;
