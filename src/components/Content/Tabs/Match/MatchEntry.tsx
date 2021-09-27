import { useState } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Button } from 'reactstrap';
import { IContextData } from '../../../Context';
import { hash } from '../../../../hash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

interface Props {
	match: I.Match;
	teams: I.Team[];
	cxt: IContextData;
	edit: Function;
	setCurrent: Function;
}

const MatchEntry = ({ match, teams, cxt, edit, setCurrent }: Props) => {
	const [isExpanded, setExpanded] = useState(false);
	const { t } = useTranslation();

	const deleteMatch = async () => {
		await api.match.delete(match.id);
		cxt.reload();
	};

	const boToWinsMap = {
		bo1: 1,
		bo2: 2,
		bo3: 2,
		bo5: 3,
		bo7: 4,
		bo9: 5
	};

	const left = teams.filter(team => match.left && team._id === match.left.id)[0];
	const right = teams.filter(team => match.right && team._id === match.right.id)[0];
	return (
		<div className={`entry-container ${match.current ? 'live' : ''} match-entry`}>
			<div className={`entry-main ${isExpanded ? 'expanded' : 'collapsed'}`}>
				<div className="match-name">
					{(left && left.shortName) || t('common.teamOne')} {t('common.vs')}{' '}
					{(right && right.shortName) || t('common.teamTwo')}
					<div className="live-indicator">{t('match.live')}</div>
				</div>

				<div className="map-score">
					<div className={`win-icon ${match.left?.wins === boToWinsMap[match.matchType] ? 'active' : ''}`}>
						{t('match.wins')}
					</div>
					{left?.logo ? (
						<img src={`${left.logo}?hash=${hash()}`} alt={`${left.name} logo`} className="team-logo" />
					) : (
						''
					)}
					<div className="score">{match.left?.wins || 0}</div>
					<div className="versus">{t('common.vs')}</div>
					<div className="score">{match.right?.wins || 0}</div>
					{right?.logo ? (
						<img src={`${right.logo}?hash=${hash()}`} alt={`${right.name} logo`} className="team-logo" />
					) : (
						''
					)}
					<div className={`win-icon ${match.right?.wins === boToWinsMap[match.matchType] ? 'active' : ''}`}>
						{t('match.wins')}
					</div>
				</div>
				<div className="match-date force-no-break">
					{match.startTime ? moment(match.startTime).format(moment.HTML5_FMT.DATE) : '-'}
				</div>
				<div className="match-time force-no-break">
					{match.startTime ? moment(match.startTime).format('LT') : '-'}
				</div>
				<div className={`side-menu-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
					<div className={`side-menu`}>
						<div
							className="toggler"
							onClick={() => {
								setExpanded(!isExpanded);
							}}
						></div>
						<Button className="round-btn edit-veto " onClick={deleteMatch}>
							{t('common.delete')}
						</Button>
						<Button
							className="round-btn lightblue-btn edit-veto"
							id={`match_id_${match.id}`}
							onClick={() => edit(match)}
						>
							{t('common.edit')}
						</Button>
						<Button
							className={`purple-btn round-btn edit-veto ${match.current ? 'current' : ''}`}
							onClick={() => setCurrent()}
						>
							{t('match.toggleLive')}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MatchEntry;
