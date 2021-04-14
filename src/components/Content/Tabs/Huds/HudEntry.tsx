import React, { useState } from 'react';
import { Row, Col, UncontrolledCollapse } from 'reactstrap';
import Config from './../../../../api/config';
import Tip from './../../../Tooltip';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import HyperLink from './../../../../styles/Hyperlink.png';
import trash from './../../../../styles/trash.svg';
import downloadIcon from './../../../../styles/downloadHUDIcon.png';
import uploadIcon from './../../../../styles/uploadHUDIcon.png';
import Settings from './../../../../styles/Settings.png';
import Display from './../../../../styles/Display.png';
import Switch from './../../../../components/Switch/Switch';
import Map from './../../../../styles/Map.png';
import Killfeed from './../../../../styles/Killfeed.png';
import { socket } from '../Live/Live';
import RemoveHUDModal from './RemoveModal';
import { hashCode } from '../../../../hash';
import { getMissingFields } from '../../../../utils';
import ElectronOnly from '../../../ElectronOnly';

interface IProps {
	hud: I.HUD;
	isActive: boolean;
	toggleConfig: (hud: I.HUD) => any;
	customFields: I.CustomFieldStore;
	loadHUDs: () => void;
	setHUDLoading: (uuid: string, isLoading: boolean) => void;
	isLoading: boolean;
}

const HudEntry = ({ isLoading, hud, isActive, toggleConfig, customFields, loadHUDs, setHUDLoading }: IProps) => {
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
	const downloadHUD = (uuid: string) => {
		setHUDLoading(uuid, true);
		api.huds.download(uuid).then(res => {
			if (!res || !res.result) {
				// TODO: Handler error
				return;
			}
			setHUDLoading(uuid, false);
			loadHUDs();
		});
	};
	const uploadHUD = (dir: string) => {
		api.huds.upload(dir);
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

	const isLocal = hud.status !== 'REMOTE';
	const isNotRemote = hud.status === 'LOCAL';

	return (
		<Row key={hud.dir} className="hudRow">
			<RemoveHUDModal isOpen={isOpen} toggle={toggleModal} hud={hud} remove={deleteHUD} />
			<Col s={12}>
				<Row>
					<Col className="centered thumb">
						{isLocal ? (
							<img
								src={`${Config.isDev ? Config.apiAddress : '/'}${
									hud.isDev ? 'dev/thumb.png' : `huds/${hud.dir}/thumbnail`
								}`}
								alt={`${hud.name}`}
							/>
						) : null}
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
									{hud.radar && isLocal ? (
										<Tip
											id={`radar_support_${hud.dir}`}
											className="radar_support"
											label={<img src={Map} className="action" alt="Supports custom radar" />}
										>
											Includes custom radar
										</Tip>
									) : null}
									{hud.killfeed && isLocal ? (
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
									{missingFieldsText.length && isLocal ? (
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
					{isLocal ? (
						<Col style={{ flex: 1 }} className="hud-options">
							<div className="centered">
								{isLocal ? (
									<img
										src={HyperLink}
										id={`hud_link_${hashCode(hud.dir)}`}
										className="action"
										alt="Local network HUD URL"
									/>
								) : null}
								{hud.panel?.length ? (
									<img
										src={Settings}
										onClick={toggleConfig(hud)}
										className="action"
										alt="HUD panel"
									/>
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
								<ElectronOnly>
									{isNotRemote ? (
										!isLoading ? (
											<img
												src={uploadIcon}
												className="action"
												onClick={() => {
													uploadHUD(hud.dir);
												}}
											/>
										) : (
											'Uploading...'
										)
									) : null}
								</ElectronOnly>
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
					) : (
						<Col style={{ flex: 1 }} className="hud-options">
							<div className="centered">
								{!isLoading ? (
									<img
										src={downloadIcon}
										className="action"
										onClick={() => {
											downloadHUD(hud.uuid);
										}}
									/>
								) : (
									'Downloading...'
								)}
							</div>
						</Col>
					)}
				</Row>
				{isLocal ? (
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
				) : null}
			</Col>
		</Row>
	);
};

export default HudEntry;
