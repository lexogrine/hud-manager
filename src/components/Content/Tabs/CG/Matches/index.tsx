import React from 'react';
import Section from '../Section';
import { IContextData } from '../../../../Context';
import { useTranslation } from 'react-i18next';
import * as I from './../../../../../api/interfaces';
import editIcon from './../../../../../styles/EditIcon.png';
import trash from './../../../../../styles/trash.svg';
import { MatchHandler } from '../Match';
import api from '../../../../../api/api';
import uuidv4 from 'uuid/v4';
import { Row, Col, Button } from 'reactstrap';

interface Props {
	cxt: IContextData;
}

const TeamPreview = ({ name, logo }: { name: string; logo?: string }) => (
	<div className="team-preview">
		<div className="team-preview-logo">{logo ? <img src={logo} /> : null}</div>
		<div className="team-preview-name">{name}</div>
	</div>
);

const MatchPreview = ({ match, cxt }: { match: I.Match; cxt: IContextData }) => {
	let left: I.Team | null = null;
	let right: I.Team | null = null;

	const deleteMatch = async () => {
		await api.match.delete(match.id);
		cxt.reload();
		if (MatchHandler.match?.id === match.id) {
			MatchHandler.edit(null);
		}
	};
	
	const setCurrent = async () => {
		await api.match.update(match.id, { ...match, current: !match.current });
		cxt.reload();
	};

	if (match) {
		if (match.left.id) {
			left = cxt.teams.find(team => team._id === match.left.id) || null;
		}

		if (match.right.id) {
			right = cxt.teams.find(team => team._id === match.right.id) || null;
		}
	}

	return (
		<div className="match-preview">
			<TeamPreview name={left?.name || 'Team #1'} logo={left?.logo} />
			<div className="match-versus">VS</div>
			<TeamPreview name={right?.name || 'Team #2'} logo={right?.logo} />
			<div className="match-edit-button" onClick={() => MatchHandler.edit(match)}>
				<img src={editIcon} />
			</div>
			<div className="match-edit-button" onClick={deleteMatch}>
				<img src={trash} />
			</div>
			<div className={`match-edit-button`} onClick={setCurrent}>
				<div className={`record-icon  ${match.current ? 'current':''}`} />
			</div>
		</div>
	);
};

const Matches = ({ cxt }: Props) => {
	const { t } = useTranslation();

	const add = async () => {
		const newMatch: I.Match = {
			id: uuidv4(),
			current: false,
			left: { id: null, wins: 0 },
			right: { id: null, wins: 0 },
			matchType: 'bo1',
			vetos: [],
			startTime: 0,
			game: cxt.game
		};

		for (let i = 0; i < 9; i++) {
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
		cxt.reload();
	};

	return (
		<Section title={t('match.matches')} cxt={cxt} width={450}>
			{cxt.matches.map(match => (
				<MatchPreview key={match.id} match={match} cxt={cxt} />
			))}
			<Row>
				<Col s={12}>
					<Button color="primary" className="modal-save" onClick={add}>
						{t('common.createNew')}
					</Button>
				</Col>
			</Row>
		</Section>
	);
};

export default Matches;
