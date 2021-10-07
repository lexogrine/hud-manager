import { useState } from 'react';
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
import { copyToClipboard } from '../../../../api/clipboard';
import ElectronOnly from '../../../ElectronOnly';
import { GameOnly } from '../Config/Config';
import { useTranslation } from 'react-i18next';

interface IProps {
	hud: I.HUD;
	isActive: boolean;
	toggleConfig: (hud: I.HUD) => any;
	customFields: I.CustomFieldStore;
	loadHUDs: () => Promise<void>;
	setHUDLoading: (uuid: string, isLoading: boolean) => void;
	isLoading: boolean;
	isCloudAvailable: boolean;
	isHUDOpened: boolean;
}

const HudEntry = ({
	isLoading,
	hud,
	isActive,
	toggleConfig,
	customFields,
	loadHUDs,
	setHUDLoading,
	isCloudAvailable,
	isHUDOpened
}: IProps) => {
	const gameToTag = (game: string) => {
		if (game === 'all') {
			return '[ALL] ';
		}
		return null;
	};
	const [isOpen, setOpen] = useState(false);
	const toggleModal = () => setOpen(!isOpen);

	const { t } = useTranslation();

	const startHUD = (dir: string) => {
		api.huds.start(dir);
	};
	const setHUD = (url: string, dir: string, isDev: boolean) => {
		if (isActive) {
			socket.emit('set_active_hlae', null, '', false);
		} else {
			socket.emit('set_active_hlae', url, dir, isDev);
		}
	};
	const deleteHUD = async () => {
		try {
			if (hud.status === 'REMOTE') {
				await api.huds.deleteFromCloud(hud.uuid);
			} else {
				await api.huds.delete(hud.dir);
			}
		} catch { }
		toggleModal();
	};
	const downloadHUD = (uuid: string) => {
		setHUDLoading(uuid, true);
		api.huds
			.download(uuid)
			.then(res => {
				if (!res || !res.result) {
					// TODO: Handler error
				}
				loadHUDs().then(() => {
					setHUDLoading(uuid, false);
				});
			})
			.catch(() => {
				loadHUDs().then(() => {
					setHUDLoading(uuid, false);
				});
			});
	};
	const uploadHUD = (dir: string, uuid: string) => {
		setHUDLoading(uuid, true);
		api.huds
			.upload(dir)
			.then(res => {
				if (!res || !res.result) {
					// TODO: Handler error
				}
				loadHUDs().then(() => {
					setHUDLoading(uuid, false);
				});
			})
			.catch(() => {
				loadHUDs().then(() => {
					setHUDLoading(uuid, false);
				});
			});
	};
	const missingFieldsText = [];
	const missingFields = getMissingFields(customFields, hud.requiredFields);
	if (missingFields) {
		missingFieldsText.push(<div>{t('huds.fields.missing')}</div>);
		if (missingFields.players) {
			missingFieldsText.push(
				<div>
					Players:{' '}
					{Object.entries(missingFields.players)
						.map(([field, type]) => t('huds.fields.fieldOfType', { field, type }))
						.join(', ')}
				</div>
			);
		}
		if (missingFields.teams) {
			missingFieldsText.push(
				<div>
					Teams:{' '}
					{Object.entries(missingFields.teams)
						.map(([field, type]) => t('huds.fields.fieldOfType', { field, type }))
						.join(', ')}
				</div>
			);
		}
	}

	const isLocal = hud.status !== 'REMOTE';
	const isNotRemote = hud.status === 'LOCAL';
	return (
		<Row key={hud.dir} className={`hudRow ${hud.publicKey ? 'signed' : ''}`}>
			<RemoveHUDModal isOpen={isOpen} toggle={toggleModal} hud={hud} remove={deleteHUD} />
			<Col s={12}>
				<Row>
					<Col className="centered thumb">
						{isLocal ? (
							<img
								src={`${Config.isDev ? Config.apiAddress : '/'}${hud.isDev ? 'dev/thumb.png' : `huds/${hud.dir}/thumbnail`
									}`}
								alt={`${hud.name}`}
							/>
						) : null}
					</Col>
					<Col style={{ flex: 10, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
						<div>
							<strong className="hudName">
								{hud.isDev ? '[DEV] ' : ''}
								{gameToTag(hud.game)}
								{hud.name}
							</strong>{' '}
							<span className="hudVersion">({hud.version})</span>
						</div>
						<div className="hud-details">
							<div className="hudAuthor">{hud.author}</div>
							{isLocal ? (
								<div className="hud-options">
										{isLocal ? (
											<Tip
												id={`hud_link_button_${hashCode(hud.dir)}`}
												label={
													<img
														src={HyperLink}
														id={`hud_link_${hashCode(hud.dir)}`}
														className="action"
														alt="Local network HUD URL"
													/>
												}
											>
												{t('huds.actions.toggleUrl')}
											</Tip>
										) : null}
										{hud.panel?.length ? (
											<Tip
												id={`hud_settings_button_${hashCode(hud.dir)}`}
												label={
													<img
														src={Settings}
														onClick={toggleConfig(hud)}
														className="action"
														alt="HUD panel"
													/>
												}
											>
												{t('huds.actions.settings')}
											</Tip>
										) : (
											''
										)}
										<ElectronOnly>
											<Tip
												id={`hud_overlay_button_${hashCode(hud.dir)}`}
												label={
													<img
														src={Display}
														onClick={() => startHUD(hud.dir)}
														className="action"
														alt="Start HUD"
													/>
												}
											>
												{t('huds.actions.overlay')}
											</Tip>
											{isNotRemote && isCloudAvailable && !hud.isDev && hud.game !== 'all' ? (
												!isLoading ? (
													<Tip
														id={`hud_upload_button_${hashCode(hud.dir)}`}
														label={
															<img
																src={uploadIcon}
																className="action"
																onClick={() => {
																	uploadHUD(hud.dir, hud.uuid);
																}}
															/>
														}
													>
														{t('huds.actions.upload')}
													</Tip>
												) : (
													t('huds.actions.uploading')
												)
											) : null}
											<Tip
												id={`hud_delete_button_${hashCode(hud.dir)}`}
												label={
													<img
														src={trash}
														onClick={toggleModal}
														className="action"
														alt="Delete HUD"
													/>
												}
											>
												{t('huds.actions.deleteLocally')}
											</Tip>
										</ElectronOnly>
										<GameOnly game="csgo">
											<ElectronOnly>
												<Tip
													id={`hud_toggle_button_${hashCode(hud.dir)}`}
													label={
														<div className="hud-toggle">
															<Switch
																id={`hud-switch-${hud.dir}`}
																isOn={isActive}
																disabled={isHUDOpened}
																handleToggle={() => setHUD(hud.url, hud.dir, hud.isDev)}
															/>
														</div>
													}
												>
													{t('huds.actions.toggleHUD')}
												</Tip>
											</ElectronOnly>
										</GameOnly>
								</div>
							) : (
								<div style={{ flex: 1 }} className="hud-options">
									<div className="centered">
										<ElectronOnly>
											{!isLoading ? (
												isCloudAvailable ? (
													<img
														src={downloadIcon}
														className="action"
														onClick={() => {
															downloadHUD(hud.uuid);
														}}
													/>
												) : null
											) : (
												t('huds.actions.downloading')
											)}
											<Tip
												id={`hud_delete_cloud_button_${hashCode(hud.dir)}`}
												label={
													<img
														src={trash}
														onClick={toggleModal}
														className="action"
														alt="Delete HUD from cloud"
													/>
												}
											>
												{t('huds.actions.deleteFromCloud')}
											</Tip>
										</ElectronOnly>
									</div>
								</div>
							)}
						</div>
						{hud.killfeed || hud.radar ? (
							<Row>
								<Col className="hud-status">
									{hud.radar && isLocal ? (
										<Tip
											id={`radar_support_${hud.dir}`}
											className="radar_support"
											label={<img src={Map} className="action" alt="Supports custom radar" />}
										>
											{t('huds.includes.customRadar')}
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
											{t('huds.includes.customKillfeed')}
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
							null
						)}
					</Col>
				</Row>
				{isLocal ? (
					<Row>
						<Col s={12}>
							<div className="match_data">
								<UncontrolledCollapse toggler={`#hud_link_${hashCode(hud.dir)}`}>
									<Tip
										id={`hud_copy_url_button_${hashCode(hud.dir)}`}
										label={
											<code
												onClick={() => {
													copyToClipboard(hud.url);
												}}
											>
												{hud.url}
											</code>
										}
									>
										{t('huds.actions.clickToCopy')}
									</Tip>
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
