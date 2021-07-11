import React, { useState, useEffect } from 'react';
import { IContextData } from './../../../../components/Context';
import * as I from './../../../../api/interfaces';
import goBack from './../../../../styles/goBack.png';
import config from './../../../../api/config';
import { Col, Row } from 'reactstrap';
import HudEntry from './ARSupportedEntry';
import ARSettings from './Settings';
import api from '../../../../api/api';
import { socket } from '../Live/Live';
const isElectron = config.isElectron;

interface IProps {
	cxt: IContextData;
	toggle: (tab: string, data?: any) => void;
}

const AR = ({ cxt, toggle }: IProps) => {
	const [active, setActive] = useState<I.HUD | I.ARModule | null>(null);
	const [huds, setHUDs] = useState<I.HUD[]>([]);
	const [ars, setARs] = useState<I.ARModule[]>([]);
	const [activeModules, setActiveModules] = useState<string[]>([]);

	const loadHUDs = async () => {
		api.huds.get().then(setHUDs);
		api.ar.get().then(ars => setARs(ars || []));
	};
	useEffect(() => {
		loadHUDs();
		socket.on('reloadHUDs', loadHUDs);

		socket.on('active_modules', (activeModules: string[]) => {
			setActiveModules(activeModules);
		});
		socket.emit('get_active_modules');
	}, []);

	const isAssetHUD = (hud: I.HUD | I.ARModule): hud is I.HUD => {
		return 'uuid' in hud;
	};

	if (active) {
		return (
			<React.Fragment>
				<div className="tab-title-container">
					<img src={goBack} onClick={() => setActive(null)} className="go-back-button" alt="Go back" />
					AR
				</div>
				<div className="tab-content-container full-scroll no-padding">
					<ARSettings cxt={cxt} hud={active.dir} section={isAssetHUD(active) ? active.ar : active.panel} />
				</div>
			</React.Fragment>
		);
	}
	return (
		<React.Fragment>
			<div className="tab-title-container">
				<img src={goBack} onClick={() => toggle('huds')} className="go-back-button" alt="Go back" />
				AR
			</div>
			<div className={`tab-content-container no-padding ${!isElectron ? 'full-scroll' : ''}`}>
				<Row className="padded">
					<Col>
						{ars.map(ar => (
							<HudEntry
								key={ar.dir}
								hud={ar}
								setActive={setActive}
								active={activeModules.some(mod => mod === ar.dir)}
							/>
						))}
						{huds
							.filter(hud => hud.ar)
							.map(hud => (
								<HudEntry key={hud.dir} hud={hud} setActive={setActive} />
							))}
					</Col>
				</Row>
			</div>
		</React.Fragment>
	);
};

export default AR;
