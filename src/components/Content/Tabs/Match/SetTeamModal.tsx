import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Input } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import { useTranslation } from 'react-i18next';

interface TeamData {
	id: string;
	wins: number;
}
interface Props {
	isOpen: boolean;
	toggle: () => void;
	side: 'right' | 'left';
	teams: I.Team[];
	team: TeamData;
	onSave: Function;
}

const SetTeamModal = ({ isOpen, toggle, side, teams, team, onSave }: Props) => {
	const [form, setForm] = useState<TeamData>({ ...team });
	const save = () => {
		if (form.id === 'empty') {
			onSave(side, null, form.wins);
			toggle();
			return;
		}
		onSave(side, form.id, form.wins);
		toggle();
	};
	const changeHandler = (name: keyof TeamData) => (event: any) => {
		if (name === 'wins') {
			form.wins = Number(event.target.value);
		} else {
			form.id = event.target.value;
		}
		setForm({ ...form });
	};

	const { t } = useTranslation();


	return (
		<Modal isOpen={isOpen} toggle={toggle} className={'veto_modal'}>
			<ModalHeader toggle={toggle}>{t('match.teamNumber', { num: side === 'left' ? 1 : 2 })}</ModalHeader>
			<ModalBody>
				<FormGroup>
					<Input type="select" name="teams" id="teams" value={form.id} onChange={changeHandler('id')}>
						<option value={'empty'}>{t('match.emptyTeam')}</option>
						{teams.map(teams => (
							<option key={teams._id} value={teams._id}>
								{teams.name}
							</option>
						))}
					</Input>
				</FormGroup>
				<FormGroup>
					<Input type="select" name="wins" id="wins" value={form.wins} onChange={changeHandler('wins')}>
						<option value={0}>0</option>
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3</option>
					</Input>
				</FormGroup>
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" onClick={save} className="modal-save">
					{t('common.save')}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

interface TeamModalsProps {
	button: JSX.Element;
	side: 'right' | 'left';
	team: any;
	teams: I.Team[];
	onSave: Function;
}

const TeamModal = ({ button, side, team, teams, onSave }: TeamModalsProps) => {
	const [isOpen, setOpen] = useState(false);

	const toggle = () => setOpen(!isOpen);

	const setOnPress = (element: JSX.Element) => {
		return React.cloneElement(element, { onClick: toggle });
	};

	return (
		<React.Fragment>
			{setOnPress(button)}
			<SetTeamModal isOpen={isOpen} toggle={toggle} side={side} team={team} teams={teams} onSave={onSave} />
		</React.Fragment>
	);
};

export default TeamModal;
