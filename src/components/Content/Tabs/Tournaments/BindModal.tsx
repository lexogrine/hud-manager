import { Modal, ModalHeader, ModalBody, Button, FormGroup, Input, ModalFooter } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import { useTranslation } from 'react-i18next';

interface Props {
	matches: I.Match[];
	isOpen: boolean;
	onChange: (bindMatchId: string) => void;
	toggle: any;
	teams: I.Team[];
	matchId: string;
	save: any;
	team?: string;
}

const BindModal = ({ matches, toggle, isOpen, matchId, onChange, save, teams, team }: Props) => {
	const { t } = useTranslation();
	const getMatchDescription = (match: I.Match) => {
		const pickedTeams = teams.filter(team => team._id === match.left.id || team._id === match.right.id);
		return `${(pickedTeams[0] && pickedTeams[0].name) || t('common.teamNumber', { num: 1 })} vs ${
			(pickedTeams[1] && pickedTeams[1].name) || t('common.teamNumber', { num: 2 })
		}`;
	};
	return (
		<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>{t('tournaments.bindMatch')}</ModalHeader>
			<ModalBody>
				<FormGroup>
					<Input
						type="select"
						name="type"
						id="match_to_bracket"
						value={matchId}
						onChange={e => onChange(e.target.value)}
					>
						<option value="" defaultChecked>
							{t('common.match')}
						</option>
						{matches
							.filter(match => !team || match.left.id === team || match.right.id === team)
							.map(match => (
								<option value={match.id} key={match.id}>
									{getMatchDescription(match)}
								</option>
							))}
					</Input>
				</FormGroup>
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" className="modal-save" onClick={save}>
					{t('common.save')}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default BindModal;
