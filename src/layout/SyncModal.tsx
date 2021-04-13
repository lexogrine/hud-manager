import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from 'reactstrap';
import { CloudSyncStatus } from '../../types/interfaces';
import api from '../api/api';
interface IProps {
	isOpen: boolean;
	setOpen: (isOpen: boolean) => void;
	syncStatus: CloudSyncStatus | null;
}

const SyncModal = ({ isOpen, setOpen, syncStatus }: IProps) => {
	const [isLoading, setLoading] = useState(false);
	const getLabel = () => {
		switch (syncStatus) {
			case 'ALL_SYNCED':
				return '';
			case 'NO_UPLOADED_RESOURCES':
				return "It seems that you haven't uploaded to cloud yet. You can upload your current database, or disable synchronization on this machine";
			case 'NO_SYNC_LOCAL':
				return 'Your local database is not synchronized with the cloud storage. You can upload local database, download remote, or disable synchronization. Be aware, that upload/download will remove the target database. What do you want to do?';
			case 'UNKNOWN_ERROR':
			default:
				return "There's been an error, so to prevent data-loss we turned off synchronization";
		}
	};
	const getActions = () => {
		switch (syncStatus) {
			case 'ALL_SYNCED':
				return [];
			case 'NO_UPLOADED_RESOURCES':
				return [
					{
						label: 'Upload',
						action: () => {
							setLoading(true);
							api.cloud.upload().then(response => {
								console.log(response);
								setLoading(false);
								setOpen(false);
							});
						},
						type: ''
					},
					{
						label: 'Disable',
						action: () => {
							setLoading(true);
							api.config.get().then(config => {
								api.config.update({ ...config, sync: false }).then(() => {
									setLoading(false);
									setOpen(false);
								});
							});
						},
						type: 'secondary'
					}
				];
			case 'NO_SYNC_LOCAL':
				return [
					{ label: 'Upload', action: () => {}, type: '' },
					{ label: 'Download', action: () => {}, type: 'secondary' },
					{ label: 'Disable', action: () => {}, type: '' }
				];
			case 'UNKNOWN_ERROR':
			default:
				return [{ label: 'Ok', action: () => setOpen(false), type: '' }];
		}
	};
	return (
		<Modal isOpen={isOpen} toggle={() => {}} className="veto_modal">
			<ModalHeader>Synchronization</ModalHeader>
			<ModalBody>
				<p>{getLabel()}</p>
				{isLoading ? <p>Loading...</p> : null}
			</ModalBody>
			<ModalFooter className="no-padding in-row">
				{getActions().map(action => (
					<Button
						key={action.label}
						color="primary"
						className={`modal-save ${action.type}`}
						onClick={action.action}
						disabled={isLoading}
					>
						{action.label}
					</Button>
				))}
			</ModalFooter>
		</Modal>
	);
};

export default SyncModal;
