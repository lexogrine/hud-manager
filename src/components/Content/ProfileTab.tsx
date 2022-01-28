import moment from 'moment';
import { useState } from 'react';
import api from '../../api/api';
import { Customer } from '../../api/interfaces';
import { ContextData, IContextData } from '../Context';
import LabeledInput from '../LabeledInput';

const ProfileTab = ({
	isOpen,
	close,
	logout,
	customer,
	loadUser
}: {
	close: () => void;
	isOpen: boolean;
	logout: () => void;
	customer: Customer;
	loadUser: () => void;
}) => {
	const [error, setError] = useState('');
	const { license } = customer;
	const endDateReal = moment(license.endTime || license.validUntil || new Date()).format('YYYY - MM - DD');
	const endDateDisplay = endDateReal.includes('2999') ? '-' : endDateReal;

	const endOfPeriod = moment(license.validUntil || new Date()).format('YYYY - MM - DD');
	const endOfPeriodDisplay = endOfPeriod.includes('2999') ? '-' : endOfPeriod;

	const isWorkspaceAvailable = (workspaceId: number, cxt: IContextData) => {
		const picked = cxt.workspaces.find(workspace => workspace.id === workspaceId);
		const isPickedValid = !!(picked && picked.available);
		return isPickedValid;
	};

	const setToNewWorkspace = (workspaceId: number, cxt: IContextData) => {
		if (!isWorkspaceAvailable(workspaceId, cxt)) return Promise.resolve();

		return api.user.setWorkspace(workspaceId || null).then(res => {
			if (!res.success) {
				setError(res.message);
				return;
			}

			return loadUser();
		});
	};

	return (
		<ContextData.Consumer>
			{cxt => (
				<div className={`profile-tab ${isOpen ? 'show' : ''}`}>
					<div className="close-icon" onClick={close}></div>
					<div className="profile-section">
						<div className="profile-subtitle">Your plan</div>
						<div className="plan">{customer.license.type}</div>
					</div>
					<div className="profile-section">
						<div className="profile-subsection">
							<div className="profile-subtitle">Valid from</div>
							<div className="profile-value">
								{license?.type === 'free' && license?.status !== 'ended'
									? '-'
									: moment(license?.startTime || new Date()).format('YYYY - MM - DD')}
							</div>
						</div>
						<div className="profile-subsection">
							<div className="profile-subtitle">Valid until</div>
							<div className="profile-value">{endDateDisplay}</div>
						</div>
					</div>
					<div className="profile-section">
						<div className="profile-subsection">
							<div className="profile-subtitle">Next payment</div>
							<div className="profile-value">
								{license && license.status === 'active' ? endOfPeriodDisplay : '-'}
							</div>
						</div>
					</div>
					{cxt.workspaces.length > 1 ? (
						<div className="workspace-select">
							<div className="workspace-error">{error}</div>
							<LabeledInput
								type="select"
								label="Workspace"
								value={cxt.workspace?.id || 0}
								onChange={e =>
									setToNewWorkspace(Number(e.target.value), cxt).then(() => {
										cxt.reload();
									})
								}
							>
								{cxt.workspaces.map(workspace => (
									<option
										disabled={!isWorkspaceAvailable(workspace.id, cxt)}
										value={workspace.id}
										key={`edit--${workspace.name}--${workspace.id}`}
									>
										{workspace.name}
									</option>
								))}
							</LabeledInput>
						</div>
					) : null}
					<div className="logout" onClick={logout}>
						Log out
					</div>
				</div>
			)}
		</ContextData.Consumer>
	);
};

export default ProfileTab;
