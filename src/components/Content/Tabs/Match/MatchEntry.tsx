import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { IContextData } from '../../../Context';
import { hash } from '../../../../hash';
import moment from 'moment';
import deleteIcon from './../../../../styles/delete.png';
import editIcon from './../../../../styles/edit.png';
import liveIcon from './../../../../styles/lives.png';
import { useTranslation } from 'react-i18next';
import { WinIcon } from './VetoEntry';

interface Props {
	match: I.Match;
	teams: I.Team[];
	cxt: IContextData;
	edit: Function;
	setCurrent: Function;
}


const MatchEntry = ({ match, teams, cxt, edit, setCurrent }: Props) => {
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
			<div className={`entry-main collapsed`}>
				<div className="match-name">
					{(left && left.shortName) || t('common.teamOne')} {t('common.vs')}{' '}
					{(right && right.shortName) || t('common.teamTwo')}
					<div className="live-indicator">{t('match.live')}</div>
				</div>

				<div className="map-score">
					<WinIcon show={match.left?.wins === boToWinsMap[match.matchType]}/>
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
					<WinIcon show={match.right?.wins === boToWinsMap[match.matchType]}/>
				</div>
				<div className="match-date">
					{match.startTime ? moment(match.startTime).format(moment.HTML5_FMT.DATE) : '-'}
				</div>
				<div className="match-time">
					{match.startTime ? moment(match.startTime).format('LT') : '-'}
				</div>
				<div className={`side-menu-container expanded`}>
					<div className={`side-menu`}>
						<img src={deleteIcon} onClick={deleteMatch} className="image-button" />
						<img src={editIcon} onClick={() => edit(match)} className="image-button" />
						<img src={liveIcon} onClick={() => setCurrent()} className="image-button" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default MatchEntry;
