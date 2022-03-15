import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
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
				return 'Your local database is not synchronized with the cloud storage. You can download or upload the database or disable synchronization. Be aware, that download will remove what you currently have on this PC, and upload will ERASE cloud storage content. What do you want to do?';
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
					reload();
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
							if (isLoading) return;
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
						type: 'empty'
					}
				];
			case 'NO_SYNC_LOCAL':
				return [
					{
						label: 'Download',
						action: () => {
							if (isLoading) return;
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
					{
						label: 'Upload',
						action: () => {
							if (isLoading) return;
							setLoading(true);
							api.cloud
								.upload(true)
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
					{ label: 'Disable', action: disableSyncing, type: 'empty' }
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
					<div
						key={action.label}
						className={`button wide green strong ${action.type} ${isLoading ? 'disabled' : ''}`}
						onClick={action.action}
					>
						{action.label}
					</div>
				))}
			</ModalFooter>
		</Modal>
	);
};

export default SyncModal;
