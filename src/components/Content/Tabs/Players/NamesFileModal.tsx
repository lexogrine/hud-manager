import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, FormGroup, Input, ModalFooter, Row, Col } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import { useTranslation } from 'react-i18next';

interface IProps {
	isOpen: boolean;
	toggle: () => void;
	players: I.Player[];
}

const NamesFileModal = ({ players, isOpen, toggle }: IProps) => {
	const [checkedPlayersId, setCheckedPlayers] = useState<string[]>([]);
	const { t } = useTranslation();

	const download = () => {
		const checkedPlayers = players.filter(player => checkedPlayersId.includes(player._id));
		const content = `"Names"
{
${checkedPlayers.map(player => `    "${player.steamid}" "${player.username}"`).join('\n')}
}
`;
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
		element.setAttribute('download', 'names.txt');

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	};
	const onChange = (e: any) => {
		const values = Array.from(e.target.selectedOptions, (option: any) => option.value).filter(id => !!id);
		setCheckedPlayers(values);
	};

	const toggleAndClear = () => {
		setCheckedPlayers([]);
		toggle();
	};

	return (
		<Modal isOpen={isOpen} toggle={toggleAndClear} className="veto_modal">
			<ModalHeader toggle={toggleAndClear}>{t('players.downloadNamesFile')}</ModalHeader>
			<ModalBody>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input
								type="select"
								multiple
								id="player_for_names"
								name="player_for_names"
								onChange={onChange}
								value={checkedPlayersId}
							>
								<option value="">{t('common.players')}</option>
								{players
									.concat()
									.sort((a, b) => (a.username < b.username ? -1 : 1))
									.map(player => (
										<option key={player._id} value={player._id}>
											{player.firstName} &quot;{player.username}&quot; {player.lastName}
										</option>
									))}
							</Input>
						</FormGroup>
					</Col>
				</Row>
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button
					comp
					color="primary"
					className="modal-save"
					onClick={download}
					disabled={!checkedPlayersId.length}
				>
					{t('common.save')}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default NamesFileModal;
