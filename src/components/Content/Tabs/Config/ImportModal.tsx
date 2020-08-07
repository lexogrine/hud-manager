import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

interface Props {
	isOpen: boolean;
	toggle: () => void;
	save: () => void;
	teams: number;
	players: number;
}
export default class VetoModal extends React.Component<Props> {
	render() {
		const { isOpen, teams, players, toggle } = this.props;
		return (
			<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
				<ModalHeader toggle={toggle}>Import conflict</ModalHeader>
				<ModalBody>
					During import we detected {teams} teams and {players} players that share the same id. If you
					continue, existing teams and players will be overwritten.
				</ModalBody>
				<ModalFooter className="no-padding">
					<Button color="primary" onClick={this.props.save} className="modal-save">
						Overwrite
					</Button>
				</ModalFooter>
			</Modal>
		);
	}
}
