import React from 'react';
import { FormGroup, Input, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

interface IProps {
	isOpen: boolean;
	areaName: string;
	setAreaName: (name: string) => void;
	close: () => void;
	saveArea: () => void;
}

const SaveAreaModal = ({ isOpen, areaName, setAreaName, close, saveArea }: IProps) => {
	return (
		<Modal isOpen={isOpen} toggle={close} className="veto_modal">
			<ModalHeader>Enter unique name for area</ModalHeader>
			<ModalBody>
				<div className="games-picker">
					<FormGroup>
						<Input
							type="text"
							name="newAreaName"
							id="newAreaName"
							onChange={e => setAreaName(e.target.value)}
							placeholder="New area name"
							value={areaName}
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" className="modal-save" onClick={saveArea} disabled={!areaName}>
					Save
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default SaveAreaModal;
