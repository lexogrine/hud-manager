import React from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { hash } from '../../../../hash';
import * as I from './../../../../api/interfaces';
import WinnerCrown from './../../../../styles/winnerCrown.png';
import { useTranslation } from 'react-i18next';

interface Props {
	isOpen: boolean;
	toggle: () => void;
	veto: I.Veto;
	saveScore: any;
	teams: I.Team[];
	setWinner: any;
}

const EditScoreModal = ({ isOpen, toggle, veto, saveScore, teams, setWinner }: Props) => {
	const { t } = useTranslation();
	const renderTeamScore = (team: I.Team | undefined, score: number) => {
		if (!team) return null;
		const isWinner = veto && veto.winner && veto.winner === team._id;
		return (
			<div key={team._id} className="team-score-container">
				<div className={`winner-crown ${isWinner ? 'winner' : ''}`}>
					<img src={WinnerCrown} />
				</div>
				<div className={`team-logo-container`}>
					<img src={`${team.logo}?hash=${hash()}`} alt={t('match.scoreModal.teamLogo')}></img>
				</div>
				<div className="team-score-edit-container">
					<div className="add">
						<div onClick={saveScore(team._id, score + 1)}>+</div>
					</div>
					<div className="map-score">{score}</div>
					<div className="remove">
						<div onClick={saveScore(team._id, score - 1)}>-</div>
					</div>
				</div>
				<div className="winner-button-container">
					<Button
						className={`lightblue-btn round-btn ${isWinner ? 'unset' : ''}`}
						onClick={setWinner(isWinner ? undefined : team._id)}
					>
						{isWinner ? t('match.scoreModal.unsetWin') : t('match.scoreModal.setWin')}
					</Button>
				</div>
			</div>
		);
	};
	const score = veto.score;
	return (
		<Modal isOpen={isOpen} toggle={toggle} className={'veto_modal'}>
			<ModalHeader className="bordered" toggle={toggle}>
				{veto.mapName.toUpperCase()}
			</ModalHeader>
			<ModalBody>
				<div className="score-editor">
					{teams.map(team => renderTeamScore(team, (score && score[team._id]) || 0))}
				</div>
			</ModalBody>
		</Modal>
	);
};

export default EditScoreModal;
