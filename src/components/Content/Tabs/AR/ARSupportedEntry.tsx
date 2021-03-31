import React from 'react';
import { Row, Col, UncontrolledCollapse } from 'reactstrap';
import Config from './../../../../api/config';
import * as I from './../../../../api/interfaces';
import HyperLink from './../../../../styles/Hyperlink.png';
import Settings from './../../../../styles/Settings.png';
import { hashCode } from '../../../../hash';
import { copyToClipboard } from '../../../../api/clipboard';

interface IProps {
	hud: I.HUD;
    setActive: (hud: I.HUD) => void;
}

const HudEntry = ({ hud, setActive }: IProps) => {

	return (
		<Row key={hud.dir} className="hudRow">
			<Col s={12}>
				<Row>
					<Col className="centered thumb">
						<img
							src={`${Config.isDev ? Config.apiAddress : '/'}${
								hud.isDev ? 'dev/thumb.png' : `huds/${hud.dir}/thumbnail`
							}`}
							alt={`${hud.name}`}
						/>
					</Col>
					<Col style={{ flex: 10, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
						<Row>
							<Col>
								<strong className="hudName">
									{hud.isDev ? '[DEV] ' : ''}
									{hud.name}
								</strong>{' '}
								<span className="hudVersion">({hud.version})</span>
							</Col>
						</Row>
						<Row>
							<Col className="hudAuthor">
								<div>{hud.author}</div>
							</Col>
						</Row>
					</Col>
					<Col style={{ flex: 1 }} className="hud-options">
						<div className="centered">
							<img
								src={HyperLink}
								id={`hud_link_${hashCode(hud.dir)}`}
								className="action"
								alt="Local network HUD URL"
							/>
                            <img src={Settings} className="action" alt="HUD panel" onClick={() => setActive(hud)} />
						</div>
					</Col>
				</Row>
				<Row>
					<Col s={12}>
						<div className="match_data">
							<UncontrolledCollapse toggler={`#hud_link_${hashCode(hud.dir)}`}>
								<code
									onClick={() => {
										copyToClipboard(hud.url);
									}}
								>
									{hud.url}
								</code>
							</UncontrolledCollapse>
						</div>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};

export default HudEntry;
