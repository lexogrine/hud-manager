import React from 'react';
import config from './../api/config';

export default class ElectronOnly extends React.Component<{ children?: React.ReactNode }> {
	render() {
		if (!config.isElectron) {
			return null;
		}
		return this.props.children;
	}
}
