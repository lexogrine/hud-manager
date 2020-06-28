import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { HUD } from '../../../../api/interfaces';

interface Props {
    isOpen: boolean,
    toggle: () => void,
    remove: () => void;
    hud: HUD;
}
export default class RemoveHUDModal extends React.Component<Props> {
    render() {
        const { isOpen, remove, toggle, hud } = this.props;
        return (
            <Modal isOpen={isOpen} toggle={toggle} className="veto_modal" >
                <ModalHeader toggle={toggle}>Removing {hud.name}</ModalHeader>
                <ModalBody>
                    Are you sure you want to remove {hud.name}?
				</ModalBody>
                <ModalFooter className="no-padding">
                    <Button color="primary" onClick={remove} className="modal-save">Delete</Button>
                </ModalFooter>
            </Modal>
        );
    }
}