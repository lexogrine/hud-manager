import React, { useState } from 'react';
import { FormGroup, Input, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

interface IProps {
	isOpen: boolean;
	close: () => void;
	save: (config: string) => void;
}

const AddConfigModal = ({ isOpen, close, save }: IProps) => {
	const [config, setConfig] = useState('');
	return (
		<Modal isOpen={isOpen} toggle={close} className="veto_modal">
			<ModalHeader>Enter config to be executed</ModalHeader>
			<ModalBody>
				<div className="games-picker">
					<FormGroup>
						<Input
							type="text"
							name="newConfigToExecute"
							id="newConfigToExecute"
							onChange={e => setConfig(e.target.value)}
							placeholder="New config to execute"
							value={config}
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" className="modal-save" onClick={() => save(config)} disabled={!config}>
					Save
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default AddConfigModal;
