import { IContextData } from './../../../../components/Context';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Row, Col, Button } from 'reactstrap';
import Panel from './Panel';
import { socket } from '../Live/Live';
import Switch from './../../../../components/Switch/Switch';
import ElectronOnly from './../../../../components/ElectronOnly';
import DragInput from './../../../DragFileInput';
import HudEntry from './HudEntry';
//import goBack from './../../../../styles/goBack.png';
import config from './../../../../api/config';
import { withTranslation } from 'react-i18next';
import { GameOnly } from '../Config/Config';
import { Component } from 'react';
import { canUserFromContextUseCloud } from '../../../../utils';
import ChangeColors from './ChangeColors';
import Tip from '../../../Tooltip';
const isElectron = config.isElectron;

function createCFG(
	customRadar: boolean,
	customKillfeed: boolean,
	afx: boolean,
	port: number,
	aco: boolean,
	autoexec = true
): I.CFG {
	let cfg = `cl_draw_only_deathnotices 1`;
	let file = 'hud';

	if (!customRadar) {
		cfg += `\ncl_drawhud_force_radar 1`;
	} else {
		cfg += `\ncl_drawhud_force_radar 0`;
		file += '_radar';
	}
	if (customKillfeed) {
		file += '_killfeed';
		cfg += `\ncl_drawhud_force_deathnotices -1`;
	}
	if (customKillfeed || aco) {
		if (aco) file += '_aco';
		cfg += `\nmirv_pgl url "ws://localhost:${port}/socket.io/?EIO=3&transport=websocket"`;
		cfg += `\nmirv_pgl start`;
	}
	if (afx) {
		file += '_interop';
		cfg = 'afx_interop connect 1';
		cfg += `\nexec ${createCFG(customRadar, customKillfeed, false, port, aco).file}`;
	}
	file += '.cfg';
	if (!autoexec) {
		file = '';
	}
	return { cfg, file };
}

interface IProps {
	cxt: IContextData;
	t: any; // TODO: Add typings. Or don't because the functional version should use useTranslation instead of withTranslation anyway
	toggle: (tab: string, data?: any) => void;
	setOnBackClick: I.HeaderHandler;
}

interface IForm {
	killfeed: boolean;
	radar: boolean;
	afx: boolean;
	ar: boolean;
	autoexec: boolean;
}

interface IState {
	config: I.Config;
	huds: I.HUD[];
	loadingHUDs: string[];
	form: IForm;
	active: I.HUD | null;
	currentHUD: string | null;
	enableTest: boolean;
	isOnLoop: boolean;
	blocked: string[];
	openXray: boolean;
	integratedHLAEReady: boolean;
	integratedAFXReady: boolean;
	isHUDOpened: boolean;
	usePreinstalled: boolean;
	isHlaeAvailable: boolean;
}

class Huds extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			loadingHUDs: [],
			huds: [],
			config: {
				steamApiKey: '',
				hlaePath: '',
				port: 1349,
				token: '',
				afxCEFHudInteropPath: '',
				sync: true,
				cg: false,
				autoSwitch: false
			},
			form: {
				killfeed: false,
				radar: false,
				afx: false,
				autoexec: true,
				ar: false
			},
			active: null,
			currentHUD: null,
			enableTest: true,
			isOnLoop: false,
			blocked: [],
			isHUDOpened: false,
			integratedHLAEReady: false,
			integratedAFXReady: false,
			usePreinstalled: false,
			openXray: false,
			isHlaeAvailable: false
		};
	}

	runGame = async () => {
		switch (this.props.cxt.game) {
			case 'csgo':
				api.csgo.run(this.state.form);
				break;
			case 'rocketleague':
				await api.bakkesmod.installSos();
				await api.bakkesmod.run();
				break;
			case 'dota2':
				api.dota2.run();
				break;
		}
	};

	toggleXrayModal = () => {
		this.setState({ openXray: !this.state.openXray });
	};

	handleZIPs = (files: FileList) => {
		const file = files[0];
		const reader: any = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			const name = file.name.substr(0, file.name.lastIndexOf('.')).replace(/\W/g, '');
			if (file.name.substr(-4) === '.rar' || !name) {
				return;
			}

			api.huds.save(reader.result, name);
		};
	};
	changeForm = (name: keyof IForm) => () => {
		const { form } = this.state;
		form[name] = !form[name];
		this.setState({ form }, () => {
			if (name === 'ar') {
				this.forceBlock(true, 'afx');
			}
		});
	};
	getConfig = async () => {
		const config = await api.config.get();
		this.setState({ config });
	};
	loadHUDs = async () => {
		const huds = await api.huds.get();
		this.setState({ huds });
	};
	setHUDLoading = (uuid: string, isLoading: boolean) => {
		const { loadingHUDs } = this.state;
		if (isLoading && !loadingHUDs.includes(uuid)) {
			this.setState({ loadingHUDs: [...loadingHUDs, uuid] });
		} else if (!isLoading && loadingHUDs.includes(uuid)) {
			this.setState({ loadingHUDs: loadingHUDs.filter(hudUUID => hudUUID !== uuid) });
		}
	};
	verifyIntegration = () => {
		if (!isElectron || !window.ipcApi) return;
		const { ipcApi } = window;
		ipcApi.receive('hlaeStatus', (status: boolean) => {
			this.setState({ isHlaeAvailable: status });
		});
		ipcApi.receive('advancedFxVersion', (app: string, ver: string) => {
			if (app === 'hlae') {
				this.setState({ integratedHLAEReady: ver !== 'None' });
			} else {
				this.setState({ integratedAFXReady: ver !== 'None' });
			}
		});
		ipcApi.receive('usePreinstalled', (usePreinstalled: boolean) => {
			this.setState({ usePreinstalled });
		});
		ipcApi.receive('advancedfx/advancedfx-update', (state: string) => {
			this.setState({ integratedHLAEReady: state === 'NO_UPDATE' || state === 'UPDATE_SUCCESS' });
		});
		ipcApi.receive('advancedfx/afx-cefhud-interop-update', (state: string) => {
			this.setState({ integratedAFXReady: state === 'NO_UPDATE' || state === 'UPDATE_SUCCESS' });
		});
		ipcApi.send('getHlaeStatus');
	};
	async componentDidMount() {
		this.verifyIntegration();
		socket.on('reloadHUDs', this.loadHUDs);
		socket.on('active_hlae', (hud: string | null) => {
			this.setState({ currentHUD: hud });
		});
		socket.on('enableTest', (status: boolean, isOnLoop: boolean) => {
			this.setState({ enableTest: status, isOnLoop });
		});
		socket.on('config', () => {
			this.getConfig();
		});
		socket.on('hud_opened', (status: boolean) => {
			this.setState({ isHUDOpened: status });
		});
		socket.emit('get_active_hlae');
		socket.emit('get_test_settings');
		socket.emit('is_hud_opened');
		this.loadHUDs();
		this.getConfig();
	}
	startHUD(dir: string) {
		api.huds.start(dir);
	}
	toggleConfig = (hud?: I.HUD) => () => {
		this.setState({ active: hud || null }, () => {
			this.props.setOnBackClick(hud ? this.toggleConfig() : null);
		});
	};
	forceBlock = (status: boolean, ...blockedToggles: (keyof IForm)[]) => {
		this.setState((state: any) => {
			for (const blocked of blockedToggles) {
				if (blocked in state.form) {
					state.form[blocked] = status;
				}
				if (state.blocked.includes(blocked)) {
					state.blocked = state.blocked.filter((el: string) => el !== blocked);
				} else {
					state.blocked.push(blocked);
				}
			}
			return state;
		});
	};

	render() {
		const { killfeed, radar, afx } = this.state.form;
		const {
			active,
			config,
			isHUDOpened,
			huds,
			usePreinstalled,
			integratedAFXReady,
			integratedHLAEReady,
			isHlaeAvailable
		} = this.state;
		const t = this.props.t;
		const available = canUserFromContextUseCloud(this.props.cxt);
		if (active) {
			return (
				<>
					{/*<div className="tab-title-container">
						<img src={goBack} onClick={this.toggleConfig()} className="go-back-button" alt="Go back" />
						HUD Settings
					</div>*/}
					<div className="tab-content-container full-scroll no-padding">
						<Panel hud={active} cxt={this.props.cxt} />
					</div>
				</>
			);
		}

		const gameHUDs = huds.filter(hud => hud.game !== 'all' && !hud.isDev);
		const independentOrDevHUDs = huds.filter(hud => hud.game === 'all' || hud.isDev);
		const { customer, workspace } = this.props.cxt;
		const isXrayAvailable =
			!(customer?.license.type !== 'enterprise' && customer?.license.type !== 'professional') || workspace;

		let message = '';

		if (!isHlaeAvailable) {
			message = 'You must have CS:GO running with HLAE';
		}

		if (!isXrayAvailable) {
			message += message ? ' and ' : 'You must have ';
			message += 'professional or enterprise plan';
		}

		return (
			<>
				<div className={`tab-content-container no-padding ${!isElectron ? 'full-scroll' : ''}`}>
					<ChangeColors isOpen={this.state.openXray} toggle={this.toggleXrayModal} />
					<GameOnly game="csgo">
						<Row className="config-container">
							<Col md="12" className="config-entry wrap">
								<div className="config-area">
									<div className="config-description">{t('huds.config.customRadar')}</div>
									<Switch
										isOn={this.state.form.radar}
										id="radar-toggle"
										handleToggle={this.changeForm('radar')}
										disabled={this.state.blocked.includes('radar')}
									/>
								</div>
								<div className="config-area">
									<div className="config-description">{t('huds.config.customKillfeedOrACO')}</div>
									<Switch
										isOn={this.state.form.killfeed}
										id="killfeed-toggle"
										handleToggle={this.changeForm('killfeed')}
										disabled={this.state.blocked.includes('killfeed')}
									/>
								</div>
								<div className="config-area">
									<div className="config-description">{t('huds.config.embeddedHUD')}</div>
									<Switch
										isOn={this.state.form.afx}
										id="afx-toggle"
										handleToggle={this.changeForm('afx')}
										disabled={this.state.blocked.includes('afx')}
									/>
								</div>
								<ElectronOnly>
									<div className="config-area">
										<div className="config-description">{t('huds.config.playTestLoop')}</div>
										<Switch
											isOn={this.state.isOnLoop}
											id="gamelopp-toggle"
											handleToggle={api.csgo.toggleLoop}
										/>
									</div>
								</ElectronOnly>
								<div className="config-area">
									<div className="config-description">{t('huds.config.ar')}</div>
									<Switch
										isOn={this.state.form.ar}
										id="ar-toggle"
										handleToggle={this.changeForm('ar')}
										disabled={this.state.blocked.includes('ar')}
									/>
								</div>
								<div className="config-area">
									<div className="config-description">{t('huds.config.autoexecute')}</div>
									<Switch
										isOn={this.state.form.autoexec}
										id="autoexec-toggle"
										handleToggle={this.changeForm('autoexec')}
										disabled={this.state.blocked.includes('autoexec')}
									/>
								</div>
								<ElectronOnly>
									<div className="config-area">
										<div className="config-description">XRAY</div>
										{isHlaeAvailable && isXrayAvailable ? (
											<div className="xray-set-button" onClick={this.toggleXrayModal}>
												SET
											</div>
										) : (
											<Tip
												id={`hlae_inactive`}
												className="hlae_inactive"
												label={<div className="xray-set-button">SET</div>}
											>
												{message}
											</Tip>
										)}
									</div>
								</ElectronOnly>
							</Col>
							<Col md="12" className="config-entry">
								<div className="running-game-container">
									<div>
										<div className="config-description">{t('huds.config.console')}</div>
										<code className="exec-code">
											exec {createCFG(radar, killfeed, afx, config.port, killfeed).file}
										</code>
										<ElectronOnly>
											<div className="config-description">{t('common.or').toUpperCase()}</div>
											<Button
												className="button green strong"
												disabled={
													(killfeed && !config.hlaePath && !usePreinstalled) ||
													(usePreinstalled && !integratedHLAEReady && killfeed) ||
													(usePreinstalled &&
														(!integratedAFXReady || !integratedHLAEReady) &&
														afx) ||
													(afx &&
														(!config.hlaePath || !config.afxCEFHudInteropPath) &&
														!usePreinstalled)
												}
												onClick={this.runGame}
											>
												{t('huds.config.runGame')}
											</Button>
											<Button
												className="button green strong empty"
												// disabled={!this.state.enableTest}
												onClick={api.csgo.runTest}
											>
												{!this.state.enableTest
													? t('huds.config.pauseTest')
													: t('huds.config.runTest')}
											</Button>
										</ElectronOnly>
									</div>

									<div className="warning">
										<ElectronOnly>
											{(killfeed || afx) &&
											((!config.hlaePath && !usePreinstalled) ||
												(usePreinstalled && !integratedHLAEReady)) ? (
												<div>{t('huds.warning.specifyHLAEPath')}</div>
											) : null}
											{killfeed ? (
												<div>
													If you only want ACO without killfeed, remove <code>_killfeed</code>{' '}
													from execute line
												</div>
											) : null}
											{afx &&
											((!config.afxCEFHudInteropPath && !usePreinstalled) ||
												(usePreinstalled && !integratedAFXReady)) ? (
												<div>{t('huds.warning.specifyAFXInteropPath')}</div>
											) : null}
											{afx &&
											((config.afxCEFHudInteropPath && config.hlaePath && !usePreinstalled) ||
												(usePreinstalled && integratedAFXReady && integratedHLAEReady)) ? (
												<div>{t('huds.warning.specifyAFXModeInfo')}</div>
											) : null}
										</ElectronOnly>
									</div>
								</div>
							</Col>
						</Row>
					</GameOnly>
					<GameOnly game={['rocketleague', 'dota2']}>
						<Row className="config-container">
							<Col md="12" className="config-entry">
								<div className="running-game-container">
									<div>
										<ElectronOnly>
											<Button
												className="round-btn run-game"
												disabled={false}
												onClick={this.runGame}
											>
												RUN GAME
											</Button>
										</ElectronOnly>
									</div>
								</div>
							</Col>
						</Row>
					</GameOnly>
					<div className="huds-options">
						<div className="hud-tabs"></div>
						<div className="huds-buttons">
							<input
								type="file"
								id={'hud-upload'}
								accept={'.zip'}
								onChange={e => {
									e.target.files && this.handleZIPs(e.target.files);
								}}
							/>
							<label htmlFor="hud-upload">
								<div className="button empty green dashed">Add new HUD</div>
							</label>
							<div className="button empty green" onClick={api.huds.openDirectory}>
								{t('huds.config.openDirectory')}
							</div>
						</div>
					</div>
					<div className="huds-container">
						{!!false && isElectron ? (
							<Col s={12}>
								<DragInput
									id={`hud_zip`}
									onChange={this.handleZIPs}
									label={t('huds.config.add')}
									accept=".zip"
								/>
							</Col>
						) : null}
						{independentOrDevHUDs.map(hud => (
							<HudEntry
								key={hud.dir}
								hud={hud}
								toggleConfig={this.toggleConfig}
								isActive={hud.url === this.state.currentHUD}
								customFields={this.props.cxt.fields}
								loadHUDs={this.loadHUDs}
								setHUDLoading={this.setHUDLoading}
								isLoading={!!hud.uuid && this.state.loadingHUDs.includes(hud.uuid)}
								isCloudAvailable={available}
								isHUDOpened={isHUDOpened}
								isHUDActive={!!this.state.currentHUD}
							/>
						))}
						{independentOrDevHUDs.length && gameHUDs.length ? <div className="huds-separator" /> : null}
						{gameHUDs.map(hud => (
							<HudEntry
								key={hud.dir}
								hud={hud}
								toggleConfig={this.toggleConfig}
								isActive={hud.url === this.state.currentHUD}
								customFields={this.props.cxt.fields}
								loadHUDs={this.loadHUDs}
								setHUDLoading={this.setHUDLoading}
								isLoading={!!hud.uuid && this.state.loadingHUDs.includes(hud.uuid)}
								isCloudAvailable={available}
								isHUDOpened={isHUDOpened}
								isHUDActive={!!this.state.currentHUD}
							/>
						))}
					</div>

					{isElectron && !!false ? (
						<Row>
							<Col className="main-buttons-container">
								<Button onClick={api.huds.openDirectory} color="primary">
									{t('huds.config.openDirectory')}
								</Button>
							</Col>
						</Row>
					) : (
						''
					)}
				</div>
			</>
		);
	}
}

export default withTranslation()(Huds);
