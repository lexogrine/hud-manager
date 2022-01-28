import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import api from '../api/api';
import { Workspace } from '../api/interfaces';
import LabeledInput from '../components/LabeledInput';
interface IProps {
	workspaces: Workspace[];
	isOpen: boolean;
	loadUser: () => void;
}

const WorkspaceModal = ({ isOpen, workspaces, loadUser }: IProps) => {
	const [workspaceId, setWorkspaceId] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const picked = workspaces.find(workspace => workspace.id === workspaceId);
	const isPickedValid = !!(picked && picked.available);

	const setWorkspace = () => {
		if (!isPickedValid) return;
		api.user.setWorkspace(workspaceId || null).then(res => {
			if (!res.success) {
				setError(res.message);
				return;
			}

			loadUser();
		});
	};

	return (
		<Modal isOpen={isOpen} toggle={() => {}} className="veto_modal game_pick">
			<ModalHeader>Pick your workspace</ModalHeader>
			<ModalBody>
				{error ? <p>{error}</p> : null}
				<LabeledInput
					type="select"
					label="Workspace"
					value={workspaceId}
					onChange={e => setWorkspaceId(Number(e.target.value))}
				>
					{workspaces.map(workspace => (
						<option
							disabled={!workspace.available}
							value={workspace.id}
							key={`${workspace.name}--${workspace.id}`}
						>
							{workspace.name}
						</option>
					))}
				</LabeledInput>
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" disabled={!isPickedValid} className="modal-save" onClick={setWorkspace}>
					Pick
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default WorkspaceModal;
