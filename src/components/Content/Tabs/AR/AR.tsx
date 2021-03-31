import React, { useState } from 'react';
import { IContextData } from './../../../../components/Context';
import * as I from './../../../../api/interfaces';
import goBack from './../../../../styles/goBack.png';
import config from './../../../../api/config';
import { Col, Row } from 'reactstrap';
import HudEntry from './ARSupportedEntry';
import ARSettings from './Settings';
const isElectron = config.isElectron;

interface IProps {
	cxt: IContextData;
	toggle: (tab: string, data?: any) => void;
	huds: I.HUD[];
}

const AR = ({ cxt, toggle, huds }: IProps) => {
	const [active, setActive] = useState<I.HUD | null>(null);

	if (!huds || !Array.isArray(huds)) {
		huds = [];
	}
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
