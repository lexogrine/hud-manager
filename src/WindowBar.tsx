import { useEffect, useState } from 'react';
import api from './api/api';
import ElectronOnly from './components/ElectronOnly';
declare global {
	interface Window {
		ipcApi: {
			send: (channel: string, ...arg: any) => void;
			receive: (channel: string, func: (...arg: any) => void) => void;
		};
	}
}

const WindowBar = () => {
	const [ version, setVersion ] = useState('-');

	useEffect(() => {
		api.config.getVersion().then(response => {
			setVersion(response.version);
		}).catch(() => {});
	}, []);

	const minimize = () => {
		if (!window.ipcApi) return;
		window.ipcApi.send('min');
	};
	const maximize = () => {
		if (!window.ipcApi) return;
		window.ipcApi.send('max');
	};
	const close = () => {
		if (!window.ipcApi) return;
		window.ipcApi.send('close');
	};
	return (
		<ElectronOnly>
			<div className="window-bar">
				<div className="window-drag-bar">
				</div>
				<div onClick={minimize} className="app-control minimize"></div>
				<div onClick={maximize} className="app-control maximize"></div>
				<div onClick={close} className="app-control close"></div>
			</div>
			<div className="lhm-logo-main">
				<div className="lhm-logo-name">
					LHM
					<div className="lhm-version">
						{version}
					</div>
				</div>
			</div>
		</ElectronOnly>
	);
};

export default WindowBar;
