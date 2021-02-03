import React, { useState } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Button } from 'reactstrap';
import { IContextData } from '../../../Context';
import { hash } from '../../../../hash';
import moment from 'moment';

interface Props {
	match: I.Match;
	teams: I.Team[];
	cxt: IContextData;
	edit: Function;
	setCurrent: Function;
}

const MatchEntry = ({ match, teams, cxt, edit, setCurrent }: Props) => {
	const [isExpanded, setExpanded] = useState(false);

	const deleteMatch = async () => {
		await api.match.delete(match.id);
		cxt.reload();
	};

	const left = teams.filter(team => team._id === match.left.id)[0];
	const right = teams.filter(team => team._id === match.right.id)[0];
	return (
		<div className={`entry-container ${match.current ? 'live' : ''} match-entry`}>
			<div className={`entry-main ${isExpanded ? 'expanded' : 'collapsed'}`}>
				<div className="match-name">
					{(left && left.shortName) || 'Team 1'} VS {(right && right.shortName) || 'Team 2'}
					<div className="live-indicator">Live</div>
				</div>

				<div className="map-score">
					{left?.logo ? (
						<img src={`${left.logo}?hash=${hash()}`} alt={`${left.name} logo`} className="team-logo" />
					) : (
						''
					)}
					<div className="score">{match.left.wins}</div>
					<div className="versus">VS</div>
					<div className="score">{match.right.wins}</div>
					{right?.logo ? (
						<img src={`${right.logo}?hash=${hash()}`} alt={`${right.name} logo`} className="team-logo" />
					) : (
						''
					)}
				</div>
				<div className="match-date force-no-break">{match.startTime ? moment(match.startTime).format(moment.HTML5_FMT.DATE) : '-'}</div>
				<div className="match-time force-no-break">{match.startTime ? moment(match.startTime).format("LT") : '-'}</div>
				<div className={`side-menu-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
					<div className={`side-menu`}>
						<div
							className="toggler"
							onClick={() => {
								setExpanded(!isExpanded);
							}}
						></div>
						<Button className="round-btn edit-veto " onClick={deleteMatch}>
							Delete
						</Button>
						<Button
							className="round-btn lightblue-btn edit-veto"
							id={`match_id_${match.id}`}
							onClick={() => edit(match)}
						>
							Edit
						</Button>
						<Button className="purple-btn round-btn edit-veto" onClick={() => setCurrent()}>
							Set live
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MatchEntry;
