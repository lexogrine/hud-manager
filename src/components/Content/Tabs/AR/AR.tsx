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
	const [active, setActive] = useState<I.HUD | null>(null);
	const [huds, setHUDs] = useState<I.HUD[]>([]);
	const loadHUDs = async () => {
		const huds = await api.huds.get();
		setHUDs(huds);
	};
	useEffect(() => {
		loadHUDs();
		socket.on('reloadHUDs', loadHUDs);
	}, [])

	if (active && active.ar) {
		return (
			<React.Fragment>
				<div className="tab-title-container">
					<img src={goBack} onClick={() => setActive(null)} className="go-back-button" alt="Go back" />
					AR
				</div>
				<div className="tab-content-container full-scroll no-padding">
					<ARSettings cxt={cxt} hud={active.dir} section={active.ar} />
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
