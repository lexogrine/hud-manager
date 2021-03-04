import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { HUD } from '../../../../api/interfaces';

interface Props {
	isOpen: boolean;
	toggle: () => void;
	remove: () => void;
	hud: HUD;
}

const RemoveHUDModal = ({ isOpen, toggle, remove, hud }: Props) => (
	<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
		<ModalHeader toggle={toggle}>Removing {hud.name}</ModalHeader>
		<ModalBody>Are you sure you want to remove {hud.name}?</ModalBody>
		<ModalFooter className="no-padding">
			<Button color="primary" onClick={remove} className="modal-save">
				Delete
			</Button>
		</ModalFooter>
	</Modal>
)
export default RemoveHUDModal;
