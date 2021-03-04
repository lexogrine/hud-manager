import React from 'react';
import config from './api/config';
import ElectronOnly from './components/ElectronOnly';
declare let window: any;
const isElectron = config.isElectron;
const fakeRequire = () => ({ ipcRenderer: null });
if (!isElectron) {
	window.require = fakeRequire;
}
const { ipcRenderer } = window.require('electron');

const WindowBar = () => {
	const minimize = () => {
		if (!ipcRenderer) return;
		ipcRenderer.send('min');
	};
	const maximize = () => {
		if (!ipcRenderer) return;
		ipcRenderer.send('max');
	};
	const close = () => {
		if (!ipcRenderer) return;
		ipcRenderer.send('close');
	};
	return (
		<ElectronOnly>
			<div className="window-bar">
				<div className="window-drag-bar">
					<div className="title-bar">Lexogrine HUD Manager</div>
				</div>
				<div onClick={minimize} className="app-control minimize"></div>
				<div onClick={maximize} className="app-control maximize"></div>
				<div onClick={close} className="app-control close"></div>
			</div>
		</ElectronOnly>
	);
};

export default WindowBar;
