import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

interface Props {
	isOpen: boolean;
	toggle: () => void;
	save: () => void;
	teams: number;
	players: number;
}

const ImportModal = ({ isOpen, toggle, save, teams, players }: Props) => (
	<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
		<ModalHeader toggle={toggle}>Import conflict</ModalHeader>
		<ModalBody>
			During import we detected {teams} teams and {players} players that share the same id. If you continue,
			existing teams and players will be overwritten.
		</ModalBody>
		<ModalFooter className="no-padding">
			<Button color="primary" onClick={save} className="modal-save">
				Overwrite
			</Button>
		</ModalFooter>
	</Modal>
);

export default ImportModal;
