import moment from 'moment';
import { Customer } from '../../api/interfaces';

const ProfileTab = ({
    isOpen,
	close,
	logout,
	customer
}: {
	close: () => void;
    isOpen: boolean;
	logout: () => void;
	customer: Customer;
}) => {
    const { license } = customer;
    const endDateReal = moment(
      license.endTime || license.validUntil || new Date()
    ).format('YYYY - MM - DD')
    const endDateDisplay = endDateReal.includes('2999') ? '-' : endDateReal

    const endOfPeriod = moment(license.validUntil || new Date()).format(
      'YYYY - MM - DD'
    )
    const endOfPeriodDisplay = endOfPeriod.includes('2999') ? '-' : endOfPeriod


	return (
        <div className={`profile-tab ${isOpen ? 'show' : ''}`}>
            <div className="close-icon" onClick={close}></div>
            <div className="profile-section">
                <div className="profile-subtitle">Your plan</div>
                <div className="plan">{customer.license.type}</div>
            </div>
            <div className="profile-section">
                <div className="profile-subsection">
                    <div className="profile-subtitle">Valid from</div>
                    <div className="profile-value">{license?.type === 'free' && license?.status !== 'ended' ? '-' : moment(license?.startTime || new Date()).format('YYYY - MM - DD')}</div>
                </div>
                <div className="profile-subsection">
                    <div className="profile-subtitle">Valid until</div>
                    <div className="profile-value">{endDateDisplay}</div>
                </div>
            </div>
            <div className="profile-section">
                <div className="profile-subsection">
                    <div className="profile-subtitle">Next payment</div>
                    <div className="profile-value">{license && license.status === 'active' ? endOfPeriodDisplay : '-'}</div>
                </div>
            </div>
            <div className="logout" onClick={logout}>
                Log out
            </div>
        </div>
	);
};

export default ProfileTab;
