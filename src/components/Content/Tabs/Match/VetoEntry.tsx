import { useState } from 'react';
import * as I from '../../../../api/interfaces';
import VetoModal from './VetoModal';
import EditScoreModal from './EditScoreModal';
import { useTranslation } from 'react-i18next';
import { GameOnly } from '../Config/Config';
import editScoreIcon from './../../../../styles/setScore.png';
import editIcon from './../../../../styles/edit.png';
import resetScoreIcon from './../../../../styles/resetScore.png';

interface Props {
	map: number;
	veto: I.Veto;
	vetoTeams: I.Team[];
	match: I.Match;
	onSave: (name: string, map: number, value: any) => void;
	maps: string[];
}

export const WinIcon = ({ show }: { show: boolean }) => {
	const { t } = useTranslation();
	if (!show) return null;
	return <div className={`win-icon active`}>{t('match.wins')}</div>;
};
const VetoScore = ({ veto, left, right }: { veto: I.Veto; left: I.Team | null; right: I.Team | null }) => {
	if (!left || !right || !veto.score) return null;
	const { t } = useTranslation();
	return (
		<div className="map-score">
			<div className="score">{veto.score[left._id] || 0}</div>
			<div className="versus">{t('common.vs')}</div>
			<div className="score">{veto.score[right._id] || 0}</div>
		</div>
	);
};
function generateDescription(veto: I.CSGOVeto, t: any, team?: I.Team, secTeam?: I.Team) {
	if (!veto.mapName) {
		return '';
	}
	if (veto.type === 'decider') {
		//return `${veto.mapName} decider`;
	}
	if (!team || !team.name || !secTeam) {
		return <strong>{t('match.wrongTeamSelected')}</strong>;
	}
	const mapNameCapitalized =
		veto.mapName.replace('de_', '').charAt(0).toUpperCase() + veto.mapName.replace('de_', '').slice(1);
	let text: string | null = t('match.vetoDescription', {
		teamName: team.name,
		vetoType: veto.type,
		mapName: mapNameCapitalized
	});
	let sidePick = '';
	if (secTeam && secTeam.name && veto.side !== 'NO') {
		sidePick = t('match.vetoSidepick.normal', {
			secondTeamName: secTeam.name,
			side: t(`common.${veto.side.toLowerCase()}`)
		});
	}
	if (veto.type === 'decider') {
		text = null;
		sidePick = t('match.vetoSidepick.decider', { mapName: mapNameCapitalized });
	}
	return (
		<strong>
			{text}
			{sidePick || null}
		</strong>
	);
}

const VetoEntry = ({ map, veto, vetoTeams, onSave, maps }: Props) => {
	const [isVetoModalOpen, setVetoModal] = useState(false);
	const [isScoreOpen, setScoreOpen] = useState(false);

	const resetScore = () => {
		onSave('winner', map, undefined);
		onSave('mapEnd', map, false);
		onSave('score', map, {});
		onSave('game', map, undefined);
		onSave('rounds', map, undefined);
	};

	const setWinner = (team?: string) => () => {
		onSave('winner', map, team);
		onSave('mapEnd', map, !!team);
	};
	const setScore = (teamId: string, score: number) => () => {
		let scores: { [key: string]: number } = {};
		if (veto.score) {
			scores = veto.score;
		}
		if (!scores[vetoTeams[0]._id]) scores[vetoTeams[0]._id] = 0;
		if (!scores[vetoTeams[1]._id]) scores[vetoTeams[1]._id] = 0;
		if (score < 0) score = 0;
		scores[teamId] = score;
		onSave('score', map, scores);
	};

	let team = vetoTeams[0];
	let secTeam = vetoTeams[1];

	if ('teamId' in veto && veto.teamId) {
		team = vetoTeams.filter(team => team._id === veto.teamId)[0];
		secTeam = vetoTeams.filter(team => team._id !== veto.teamId)[0];
	}

	const { t } = useTranslation();

	return (
		<GameOnly game={['csgo', 'dota2']}>
			<div
				className={`veto-entry-container ${
					'teamId' in veto ? `${veto.teamId === '' ? 'empty' : ''} ${veto.teamId ? veto.type : ''}` : ''
				}`}
			>
				{vetoTeams.length !== 2 ? (
					t('match.pickBothTeams')
				) : (
					<>
						<div className="entry-main">
							<div className={`veto-description`}>
								<span className={`veto-summary`}>
									{t('common.vetoNumber', { num: map + 1 })}:{' '}
									{'mapName' in veto ? generateDescription(veto, t, team, secTeam) : null}
								</span>
							</div>
							<VetoScore veto={veto} left={team} right={secTeam} />
							{'mapName' in veto && veto.mapName ? (
								<div
									className={`preview ${veto.mapName.replace('de_', '')} ${veto.type}`}
									onClick={() => setVetoModal(!isVetoModalOpen)}
								>
									{veto.mapName.replace('de_', '')}
								</div>
							) : null}
							<div className={`side-menu-container`}>
								<div className={`side-menu`}>
									<img src={resetScoreIcon} className="image-button" onClick={resetScore} />
									{!('mapName' in veto) || veto.mapName ? (
										<img
											src={editScoreIcon}
											className="image-button"
											onClick={() => setScoreOpen(!isScoreOpen)}
										/>
									) : null}
									<img
										src={editIcon}
										className="image-button"
										onClick={() => setVetoModal(!isVetoModalOpen)}
									/>
								</div>
							</div>
						</div>
						{!('mapName' in veto) || veto.mapName ? (
							<EditScoreModal
								setWinner={setWinner}
								teams={vetoTeams}
								toggle={() => setScoreOpen(!isScoreOpen)}
								isOpen={isScoreOpen}
								order={map + 1}
								veto={veto}
								saveScore={setScore}
							/>
						) : null}
						<VetoModal
							maps={maps}
							map={map}
							veto={veto}
							teams={vetoTeams}
							isOpen={isVetoModalOpen}
							toggle={() => setVetoModal(!isVetoModalOpen)}
							onChange={onSave}
						/>
					</>
				)}
			</div>
		</GameOnly>
	);
};

export default VetoEntry;
