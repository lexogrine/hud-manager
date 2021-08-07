import { ReactElement } from 'react';
import config from './../api/config';

const ElectronOnly = ({ children }: { children: React.ReactNode }) => {
	if (!config.isElectron) {
		return null;
	}
	return children as ReactElement<any>;
};

export default ElectronOnly;
