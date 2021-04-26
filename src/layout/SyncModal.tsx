import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from 'reactstrap';
import { CloudSyncStatus } from '../../types/interfaces';
import api from '../api/api';
interface IProps {
	isOpen: boolean;
	setOpen: (isOpen: boolean) => void;
	reload: () => void;
	syncStatus: CloudSyncStatus | null;
}

const SyncModal = ({ isOpen, setOpen, syncStatus, reload }: IProps) => {
	const [isLoading, setLoading] = useState(false);
	const getLabel = () => {
		switch (syncStatus) {
			case 'ALL_SYNCED':
				return '';
			case 'NO_UPLOADED_RESOURCES':
				return "It seems that you haven't uploaded to cloud yet. You can upload your current database, or disable synchronization on this machine";
			case 'NO_SYNC_LOCAL':
				return 'Your local database is not synchronized with the cloud storage. You can download the database or disable synchronization. Be aware, that download will remove the target database. What do you want to do?';
			case 'UNKNOWN_ERROR':
			default:
				return "There's been an error, so to prevent data-loss we turned off synchronization";
		}
	};
	const getActions = () => {
		const disableSyncing = () => {
			setLoading(true);
			api.config.get().then(config => {
				api.config.update({ ...config, sync: false }).then(() => {
					setLoading(false);
					setOpen(false);
				});
			});
		};
		switch (syncStatus) {
			case 'ALL_SYNCED':
				return [];
			case 'NO_UPLOADED_RESOURCES':
				return [
					{
						label: 'Upload',
						action: () => {
							setLoading(true);
							api.cloud
								.upload()
								.then(() => {
									setLoading(false);
									setOpen(false);
								})
								.catch(() => {
									// Handle error
								});
						},
						type: ''
					},
					{
						label: 'Disable',
						action: disableSyncing,
						type: 'secondary'
					}
				];
			case 'NO_SYNC_LOCAL':
				return [
					{
						label: 'Download',
						action: () => {
							setLoading(true);
							api.cloud
								.download()
								.then(reload)
								.then(() => {
									setLoading(false);
									setOpen(false);
								})
								.catch(() => {
									// Handle error
								});
						},
						type: ''
					},
					{ label: 'Disable', action: disableSyncing, type: 'secondary' }
				];
			case 'UNKNOWN_ERROR':
			default:
				return [{ label: 'Ok', action: disableSyncing, type: '' }];
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
