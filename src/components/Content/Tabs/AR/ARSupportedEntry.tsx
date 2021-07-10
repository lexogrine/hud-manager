import React from 'react';
import { Row, Col, UncontrolledCollapse } from 'reactstrap';
import Config from './../../../../api/config';
import * as I from './../../../../api/interfaces';
import HyperLink from './../../../../styles/Hyperlink.png';
import Settings from './../../../../styles/Settings.png';
import { hashCode } from '../../../../hash';
import { copyToClipboard } from '../../../../api/clipboard';
import { socket } from '../Live/Live';
import Tip from '../../../Tooltip';
import Switch from '../../../Switch/Switch';
import { useTranslation } from 'react-i18next';

interface IProps {
	hud: I.HUD | I.ARModule;
	setActive: (hud: I.HUD | I.ARModule) => void;
	active?: boolean;
}

const HudEntry = ({ hud, setActive, active }: IProps) => {
	const { t } = useTranslation();
	return (
		<Row key={hud.dir} className="hudRow">
			<Col s={12}>
				<Row>
					{
						"isDev" in hud ? (
							<Col className="centered thumb">
								<img
									src={`${Config.isDev ? Config.apiAddress : '/'}${
										hud.isDev ? 'dev/thumb.png' : `huds/${hud.dir}/thumbnail`
										}`}
									alt={`${hud.name}`}
								/>
							</Col>
						) : null
					}
					<Col style={{ flex: 10, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
						<Row>
							<Col>
								<strong className="hudName">
									{"isDev" in hud && hud.isDev ? '[DEV] ' : ''}
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
							{
								"isDev" in hud ? (
									<img
										src={HyperLink}
										id={`hud_link_${hashCode(hud.dir)}`}
										className="action"
										alt="Local network HUD URL"
									/>
								) : null
							}
							{
								"isDev" in hud || hud.panel ? (
									<img src={Settings} className="action" alt="HUD panel" onClick={() => setActive(hud)} />
								) : null
							}

						</div>

						{
							!("isDev" in hud) ? (<>
								<Tip
									id={`ar_toggle_button_${hashCode(hud.dir)}`}
									label={
										<div className="hud-toggle">
											<Switch
												id={`ar-switch-${hud.dir}`}
												isOn={!!active}
												disabled={false}
												handleToggle={() => socket.emit('toggle_module', hud.dir)}
											/>
										</div>
									}
								>
									{t('huds.actions.toggleHUD')}
								</Tip>
							</>) : null
						}
					</Col>
				</Row>
				{"url" in hud ? <Row>
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
				</Row> : null}
			</Col>
		</Row>
	);
};

export default HudEntry;
