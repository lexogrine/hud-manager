import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { HUD } from '../../../../api/interfaces';
import { useTranslation } from 'react-i18next';

interface Props {
	isOpen: boolean;
	toggle: () => void;
	remove: () => void;
	hud: HUD;
}

const RemoveHUDModal = ({ isOpen, toggle, remove, hud }: Props) => {
	const { t } = useTranslation();
	return (
		<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>{t('huds.removal.title', {hud: hud.name})}</ModalHeader>
			<ModalBody>{t('huds.removal.areYouSure', {hud: hud.name})}</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" onClick={remove} className="modal-save">
					{t('common.delete')}
			</Button>
			</ModalFooter>
		</Modal>
	)
};
export default RemoveHUDModal;
