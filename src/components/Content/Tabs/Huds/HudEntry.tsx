import React, { useState } from 'react';
import { Row, Col, UncontrolledCollapse } from 'reactstrap';
import Config from './../../../../api/config';
import Tip from './../../../Tooltip';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import HyperLink from './../../../../styles/Hyperlink.png';
import trash from './../../../../styles/trash.svg';
import Settings from './../../../../styles/Settings.png';
import Display from './../../../../styles/Display.png';
import Switch from './../../../../components/Switch/Switch';
import Map from './../../../../styles/Map.png';
import Killfeed from './../../../../styles/Killfeed.png';
import { socket } from '../Live/Live';
import RemoveHUDModal from './RemoveModal';
import { hashCode } from '../../../../hash';
import { getMissingFields } from '../../../../utils';

interface IProps {
	hud: I.HUD;
	isActive: boolean;
	toggleConfig: (hud: I.HUD) => any;
	customFields: I.CustomFieldStore;
}

const HudEntry = ({ hud, isActive, toggleConfig, customFields }: IProps) => {
	const [isOpen, setOpen] = useState(false);
	const toggleModal = () => setOpen(!isOpen);

	const startHUD = (dir: string) => {
		api.huds.start(dir);
	};
	const setHUD = (url: string) => {
		socket.emit('set_active_hlae', url);
	};
	const deleteHUD = async () => {
		try {
			await api.huds.delete(hud.dir);
		} catch {}
		toggleModal();
	};
	const missingFieldsText = [];
	const missingFields = getMissingFields(customFields, hud.requiredFields);
	if (missingFields) {
		missingFieldsText.push(<div>Missing fields</div>);
		if (missingFields.players) {
			missingFieldsText.push(
				<div>
					Players:{' '}
					{Object.entries(missingFields.players)
						.map(([field, type]) => `Field "${field}" of type "${type}"`)
						.join(', ')}
				</div>
			);
		}
		if (missingFields.teams) {
			missingFieldsText.push(
				<div>
					Teams:{' '}
					{Object.entries(missingFields.teams)
						.map(([field, type]) => `Field "${field}" of type "${type}"`)
						.join(', ')}
				</div>
			);
		}
	}
	return (
		<Row key={hud.dir} className="hudRow">
			<RemoveHUDModal isOpen={isOpen} toggle={toggleModal} hud={hud} remove={deleteHUD} />
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
						{hud.killfeed || hud.radar ? (
							<Row>
								<Col className="hud-status">
									{hud.radar ? (
										<Tip
											id={`radar_support_${hud.dir}`}
											className="radar_support"
											label={<img src={Map} className="action" alt="Supports custom radar" />}
										>
											Includes custom radar
										</Tip>
									) : null}
									{hud.killfeed ? (
										<Tip
											id={`killfeed_support_${hud.dir}`}
											className="killfeed_support"
											label={
												<img src={Killfeed} className="action" alt="Supports custom killfeed" />
											}
										>
											Includes custom killfeed
										</Tip>
									) : null}
									{missingFieldsText.length ? (
										<Tip
											id={`missing_fields_${hud.dir}`}
											className="missing_fields"
											label={<i className="material-icons">warning</i>}
										>
											{missingFieldsText}
										</Tip>
									) : null}
								</Col>
							</Row>
						) : (
							''
						)}
					</Col>
					<Col style={{ flex: 1 }} className="hud-options">
						<div className="centered">
							<img
								src={HyperLink}
								id={`hud_link_${hashCode(hud.dir)}`}
								className="action"
								alt="Local network HUD URL"
							/>
							{hud.panel?.length ? (
								<img src={Settings} onClick={toggleConfig(hud)} className="action" alt="HUD panel" />
							) : (
								''
							)}
							{Config.isElectron ? (
								<img
									src={Display}
									onClick={() => startHUD(hud.dir)}
									className="action"
									alt="Start HUD"
								/>
							) : null}
							{Config.isElectron && !hud.isDev ? (
								<img src={trash} onClick={toggleModal} className="action" alt="Delete HUD" />
							) : null}
						</div>
						{Config.isElectron ? (
							<div className="hud-toggle">
								<Switch
									id={`hud-switch-${hud.dir}`}
									isOn={isActive}
									handleToggle={() => setHUD(hud.url)}
								/>
							</div>
						) : null}
					</Col>
				</Row>
				<Row>
					<Col s={12}>
						<div className="match_data">
							<UncontrolledCollapse toggler={`#hud_link_${hashCode(hud.dir)}`}>
								<code
									onClick={() => {
										navigator.clipboard.writeText(hud.url).catch(console.error);
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
