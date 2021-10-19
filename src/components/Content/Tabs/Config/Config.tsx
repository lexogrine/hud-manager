import { FormGroup, Row, Col } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import api from './../../../../api/api';
import config from './../../../../api/config';
import DragInput from './../../../DragFileInput';
import ImportModal from './ImportModal';
import { IContextData, ContextData } from '../../../Context';
import ElectronOnly from '../../../ElectronOnly';
import { withTranslation } from 'react-i18next';
import Switch from '../../../Switch/Switch';
import { socket } from '../Live/Live';
import { Component } from 'react';
import LabeledInput from '../../../LabeledInput';

const { isElectron } = config;

interface ConfigStatus extends I.CFGGSIObject {
	loading: boolean;
}

interface ExtendedFile extends File {
	path: string;
}

type GameInfo = {
	gsi: ConfigStatus;
	cfg: ConfigStatus;
};

interface IProps {
	cxt: IContextData;
	toggle: Function;
	gsiCheck: Function;
	t: any;
}

const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	const result = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

	if (result === 1024) {
		return `1 ${sizes[i + 1]}`;
	}

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

let latestGame: I.AvailableGames = 'csgo';

export const GameOnly = ({ game, children }: { game: I.AvailableGames | I.AvailableGames[]; children: any }) => (
	<ContextData.Consumer>
		{cxt => {
			if (!cxt.game) return null;
			if (Array.isArray(game)) {
				if (!game.includes(cxt.game)) {
					return null;
				}
			} else {
				if (game !== cxt.game) return null;
			}
			return children;
		}}
	</ContextData.Consumer>
);

const SpaceLeft = ({ max, used }: { max: number; used: number }) => {
	return (
		<div className="space-left-container">
			<div className="space-info">
				<div className="space-label">Space used</div>
				<div className="space-bar">
					<div className="filling" style={{ width: `${(100 * used) / max}%` }} />
				</div>
			</div>
			<div className="space-amount">
				<div className="space-left">{formatBytes(used, 0)}</div>
				<div className="space-max">&nbsp;/ {formatBytes(max, 0)}</div>
			</div>
		</div>
	);
};

const SpaceLeftContainer = () => (
	<ContextData.Consumer>{cxt => <SpaceLeft max={1024 * 1024 * 1024} used={cxt.spaceUsed} />}</ContextData.Consumer>
);

interface IState {
	config: I.Config;
	csgo: GameInfo;
	dota2: GameInfo;
	bakkesModStatus: I.BakkesModStatus;
	bakkesModAutoconfBusy: boolean;
	bakkesModAutoconfError: string | null;
	restartRequired: boolean;
	importModalOpen: boolean;
	conflict: {
		teams: number;
		players: number;
	};
	update: {
		available: boolean;
		version: string;
		installing: boolean;
	};
	ip: string;
	data: any;
}

class Config extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			config: {
				steamApiKey: '',
				port: 1349,
				token: '',
				hlaePath: '',
				afxCEFHudInteropPath: '',
				sync: true,
				cg: false,
				autoSwitch: false
			},
			csgo: {
				gsi: {
					success: false,
					loading: true,
					message: 'Loading data about GameState files...',
					accessible: true
				},
				cfg: {
					success: false,
					loading: true,
					message: 'Loading data about cfg files...',
					accessible: true
				}
			},
			dota2: {
				gsi: {
					success: false,
					loading: true,
					message: 'Loading data about GameState files...',
					accessible: true
				},
				cfg: {
					success: false,
					loading: true,
					message: 'Loading data about cfg files...',
					accessible: true
				}
			},
			bakkesModStatus: {
				bakkesModExeDownloaded: false,
				bakkesModDataDownloaded: false,
				bakkesModDataInstalled: false,
				sosPluginDownloaded: false,
				sosPluginInstalled: false,
				sosConfigSet: false,
				bakkesModRunning: false
			},
			bakkesModAutoconfBusy: true,
			bakkesModAutoconfError: null,
			importModalOpen: false,
			restartRequired: false,
			conflict: {
				teams: 0,
				players: 0
			},
			update: {
				available: false,
				version: '',
				installing: false
			},
			data: {},
			ip: ''
		};
	}
	loadEXE = (type: 'hlaePath' | 'afxCEFHudInteropPath') => (files: FileList) => {
		if (!files) return;
		const file = files[0] as ExtendedFile;
		if (!file) {
			this.setState(state => {
				state.config[type] = '';
				return state;
			});
			return;
		}
		if (!file.path) return;
		const path = file.path;
		this.setState(state => {
			state.config[type] = path;
			return state;
		});
	};
	import = (data: any, callback: any) => async () => {
		try {
			await api.files.sync(data);
		} catch {}
		this.setState({ data: {}, conflict: { teams: 0, players: 0 }, importModalOpen: false }, callback);
	};
	importCheck = (callback: any) => (files: FileList) => {
		if (!files) return;
		const file = files[0] as ExtendedFile;
		if (!file) {
			return;
		}
		if (file.type !== 'application/json') return;
		const reader: any = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = async () => {
			try {
				const db64 = reader.result.replace(/^data:application\/json;base64,/, '');
				const db = JSON.parse(Buffer.from(db64, 'base64').toString());
				const response = await api.files.syncCheck(db);
				if (!response) {
					return;
				}
				if (!response.players && !response.teams) {
					return this.import(db, callback)();
				}
				this.setState({
					conflict: {
						players: response.players,
						teams: response.teams
					},
					importModalOpen: true,
					data: db
				});
			} catch {}
		};
	};
	download = (target: 'gsi' | 'cfgs' | 'db') => {
		api.config.download(target);
	};
	getDownloadUrl = (target: 'gsi' | 'cfgs') => {
		return `${config.isDev ? config.apiAddress : '/'}api/${target}/download`;
	};
	getConfig = async () => {
		const config = await api.config.get();

		const { ip, ...cfg } = config;

		this.setState({ config: cfg, ip });
	};
	createGSI = async () => {
		const { game } = this.props.cxt as { game: 'dota2' | 'csgo' };
		if (!game || (game !== 'csgo' && game !== 'dota2')) return;

		const { gsi } = this.state[game];
		if (gsi?.loading || gsi?.success || !gsi?.accessible) {
			return;
		}
		gsi.message = 'Loading GameState data...';
		if (game === 'csgo') {
			this.setState({ csgo: this.state[game] });
		} else {
			this.setState({ dota2: this.state[game] });
		}

		await api.gamestate.create(game);
		this.checkGSI();
		this.props.gsiCheck();
	};
	createCFG = async () => {
		const { game } = this.props.cxt as { game: 'dota2' | 'csgo' };
		if (!game || (game !== 'csgo' && game !== 'dota2')) return;

		const { cfg } = this.state[game];
		if (cfg?.loading || cfg?.success || !cfg?.accessible) {
			return;
		}
		cfg.message = 'Loading GameState file data...';

		if (game === 'csgo') {
			this.setState({ csgo: this.state[game] });
		} else {
			this.setState({ dota2: this.state[game] });
		}
		await api.cfgs.create(game);
		this.checkCFG();
		this.props.gsiCheck();
	};
	checkGSI = async () => {
		const { game } = this.props.cxt as { game: 'dota2' | 'csgo' };
		if (!game || (game !== 'csgo' && game !== 'dota2')) return;
		const { gsi } = this.state[game];
		gsi.message = 'Loading GameState file data...';

		if (game === 'csgo') {
			this.setState({ csgo: this.state[game] });
		} else {
			this.setState({ dota2: this.state[game] });
		}

		const response = await api.gamestate.check(game);

		if (response.success === false) {
			gsi.success = false;
			gsi.message = response.message;
			gsi.loading = false;
			gsi.accessible = response.accessible;
		} else {
			gsi.success = true;
			gsi.message = undefined;
			gsi.loading = false;
			gsi.accessible = true;
		}
		if (game === 'csgo') {
			this.setState({ csgo: this.state[game] });
		} else {
			this.setState({ dota2: this.state[game] });
		}

		return;
	};

	checkCFG = async () => {
		const { game } = this.props.cxt as { game: 'dota2' | 'csgo' };
		if (!game || (game !== 'csgo' && game !== 'dota2')) return;

		const { cfg } = this.state[game];
		cfg.message = 'Loading config file data...';

		if (game === 'csgo') {
			this.setState({ csgo: this.state[game] });
		} else {
			this.setState({ dota2: this.state[game] });
		}

		const response = await api.cfgs.check(game);

		if (response.success === false) {
			cfg.success = false;
			cfg.message = response.message;
			cfg.loading = false;
			cfg.accessible = response.accessible;
		} else {
			cfg.success = true;
			cfg.message = undefined;
			cfg.loading = false;
			cfg.accessible = true;
		}
		if (game === 'csgo') {
			this.setState({ csgo: this.state[game] });
		} else {
			this.setState({ dota2: this.state[game] });
		}

		return;
	};

	componentDidUpdate() {
		if (latestGame !== this.props.cxt.game) {
			latestGame = this.props.cxt.game;
			this.checkCFG();
			this.checkGSI();
		}
	}

	loadBakkesModStatus = async (keepBusyOnSuccess?: boolean) => {
		const response = await api.bakkesmod.check();
		if (!response.success)
			this.setState({ bakkesModAutoconfBusy: false, bakkesModAutoconfError: 'Unable to determine state' });

		this.setState({ bakkesModAutoconfBusy: keepBusyOnSuccess || false, bakkesModStatus: response.status });
		return response.status;
	};

	getBakkesModStatusDescription = () => {
		if (this.state.bakkesModAutoconfBusy) return 'Busy...';

		const status = this.state.bakkesModStatus;
		if (!status.bakkesModDataInstalled) return 'BakkesMod not installed';
		if (!status.sosPluginInstalled) return 'SOS Plugin not installed';
		if (!status.sosConfigSet) return 'Not configured';
		return 'Installed';
	};

	installRLIntegration = async () => {
		if (this.state.bakkesModAutoconfBusy) return;
		const status = await this.loadBakkesModStatus(true);

		try {
			if (!status.bakkesModDataInstalled) {
				if (!status.bakkesModDataDownloaded) {
					const downloadStatus: I.BakkesModAPIResponse = await api.bakkesmod.downloadModData();
					if (!downloadStatus.success) {
						this.setState({
							bakkesModAutoconfError: downloadStatus.message || 'Failed to download BakkesMod data',
							bakkesModAutoconfBusy: false
						});
						return;
					}
				}
				const installStatus = await api.bakkesmod.installModData();
				if (!installStatus.success) {
					this.setState({
						bakkesModAutoconfError: installStatus.message || 'Failed to install BakkesMod data',
						bakkesModAutoconfBusy: false
					});
					return;
				}
			}
			if (!status.bakkesModExeDownloaded) {
				const downloadStatus: I.BakkesModAPIResponse = await api.bakkesmod.downloadMod();
				if (!downloadStatus.success) {
					this.setState({
						bakkesModAutoconfError: downloadStatus.message || 'Failed to download BakkesMod',
						bakkesModAutoconfBusy: false
					});
					return;
				}
			}
			if (!status.sosPluginInstalled || !status.sosConfigSet) {
				if (!status.sosPluginDownloaded) {
					const downloadStatus = await api.bakkesmod.downloadSos();
					if (!downloadStatus.success) {
						this.setState({
							bakkesModAutoconfError: downloadStatus.message || 'Failed to download SOS Plugin',
							bakkesModAutoconfBusy: false
						});
						return;
					}
				}
				const installStatus = await api.bakkesmod.installSos();
				if (!installStatus.success) {
					this.setState({
						bakkesModAutoconfError: installStatus.message || 'Failed to install and configure SOS Plugin',
						bakkesModAutoconfBusy: false
					});
					return;
				}

				this.setState({
					bakkesModAutoconfError: null
				});
			}
		} catch (e) {
			this.setState({ bakkesModAutoconfError: 'Unknown error' });
		}

		this.loadBakkesModStatus();
	};

	async componentDidMount() {
		this.getConfig();
		this.checkCFG();
		this.checkGSI();
		this.checkUpdate();
		this.loadBakkesModStatus();
		socket.on('config', () => {
			this.getConfig();
		});
	}
	checkUpdate = () => {
		if (!isElectron || !window.ipcApi) return;
		window.ipcApi.receive('updateStatus', (data: boolean, version: string) => {
			this.setState(state => {
				state.update.available = data;
				state.update.version = version;
				return state;
			});
		});

		window.ipcApi.send('checkUpdate');
	};
	installUpdate = () => {
		if (!isElectron || !window.ipcApi) return;
		this.setState(
			state => {
				state.update.installing = true;
				return state;
			},
			() => {
				window.ipcApi.send('updateApp');
			}
		);
	};
	changeHandler = (event: any) => {
		const name: 'steamApiKey' | 'port' | 'token' = event.target.name;
		const { config }: any = this.state;
		config[name] = event.target.value;
		this.setState({ config });
		// this.setState({ value })
	};
	toggleHandler = (event: any) => {
		const { cxt } = this.props;
		const available =
			cxt.customer?.license?.type === 'professional' || cxt.customer?.license?.type === 'enterprise';
		if (!available) return;
		const val = event.target.checked;
		this.setState(state => {
			state.config.sync = val;

			return state;
		});
	};
	cgToggleHandler = (event: any) => {
		const val = !!event.target.checked;
		this.setState(state => {
			state.config.cg = val;
			return state;
		});
	};
	autoSwitchToggleHandler = (event: any) => {
		const val = !!event.target.checked;
		this.setState(state => {
			state.config.autoSwitch = val;
			return state;
		});
	};
	toggleModal = () => {
		this.setState({ importModalOpen: !this.state.importModalOpen });
	};
	save = async () => {
		const { config } = this.state;
		const oldConfig = await api.config.get();
		if (oldConfig.port !== config.port) {
			this.setState({ restartRequired: true });
		}
		await api.config.update(config);
		this.checkGSI();
	};

	render() {
		const { cxt, t } = this.props;
		const { importModalOpen, conflict, data, ip, config, update } = this.state;

		const gameInfo = this.state[(cxt.game || 'csgo') as 'dota2' | 'csgo'] as GameInfo;
		const { gsi, cfg } = gameInfo || {};

		const available =
			cxt.customer?.license?.type === 'professional' || cxt.customer?.license?.type === 'enterprise';
		const active = Boolean(available && config.sync);

		// const didBuy = cxt.customer?.license?.type && cxt.customer.license.type !== 'free';

		return (
			<>
				<div className="tab-content-container no-padding">
					<ImportModal
						isOpen={importModalOpen}
						toggle={this.toggleModal}
						teams={conflict.teams}
						players={conflict.players}
						save={this.import(data, cxt.reload)}
					/>
					{ active ? <SpaceLeftContainer /> : null }
					<ElectronOnly>
						<Col md="12" className="config-entry">
							<div className="config-description">
								{t('settings.updater.version')}: {update.version}
								{update.available ? (
									<div
										style={{ marginLeft: '15px' }}
										className={`button green strong ${update.installing ? 'disabled empty' : ''}`}
										onClick={
											update.installing || !update.available ? this.installUpdate : undefined
										}
									>
										{update.installing
											? t('settings.updater.installing')
											: t('settings.updater.install')}
									</div>
								) : null}
							</div>
						</Col>
					</ElectronOnly>
					<Row className="padded base-config">
						<Col md="4">
							<FormGroup>
								<LabeledInput
									type="text"
									name="steamApiKey"
									id="steamApiKey"
									label="Steam API Key"
									onChange={this.changeHandler}
									value={this.state.config.steamApiKey}
									placeholder={t('settings.input.steamAPIKey')}
								/>
							</FormGroup>
						</Col>
						<Col md="4">
							<FormGroup>
								<LabeledInput
									type="number"
									name="port"
									id="port"
									label="GSI Port"
									onChange={this.changeHandler}
									value={this.state.config.port}
									placeholder={t('settings.input.GSIPort')}
								/>
							</FormGroup>
						</Col>
						<Col md="4">
							<FormGroup>
								<LabeledInput
									type="text"
									name="token"
									id="token"
									label="GSI Token"
									onChange={this.changeHandler}
									value={this.state.config.token}
									placeholder={t('settings.input.GSIToken')}
								/>
							</FormGroup>
						</Col>
					</Row>
					<Row className="config-container bottom-margin">
						<Col md="12" className="config-entry">
							<div className="config-description">Cloud Synchronization</div>
							<Switch isOn={active} id="sync-toggle" handleToggle={this.toggleHandler} />
						</Col>
						<GameOnly game="csgo">
							<Col md="12" className="config-entry">
								<div className="config-description">Auto switch:</div>
								<Switch
									isOn={this.state.config.autoSwitch}
									id="autoswitch-toggle"
									handleToggle={this.autoSwitchToggleHandler}
								/>
							</Col>
						</GameOnly>

						{/*<ElectronOnly>
							<Col md="12" className="config-entry">
								<div className="config-description">CG Mode (Beta):</div>
								<Switch
									isOn={this.state.config.cg}
									id="cg-toggle"
									handleToggle={this.cgToggleHandler}
									disabled={!didBuy}
								/>
							</Col>
						</ElectronOnly>*/}

						<GameOnly game="csgo">
							<Col md="12" className="config-entry">
								<div className="config-description">
									HLAE Path: {this.state.config.hlaePath ? 'Loaded' : 'Not loaded'}
								</div>
								<DragInput
									id="hlae_input"
									label="SET HLAE PATH"
									accept=".exe"
									onChange={this.loadEXE('hlaePath')}
									className="path_selector"
									removable
								/>
							</Col>
							{
								<Col md="12" className="config-entry">
									<div className="config-description">
										AFX CEF HUD Interop:{' '}
										{this.state.config.afxCEFHudInteropPath ? 'Loaded' : 'Not loaded'}
									</div>
									<DragInput
										id="afx_input"
										label="SET AFX PATH"
										accept=".exe"
										onChange={this.loadEXE('afxCEFHudInteropPath')}
										className="path_selector"
										removable
									/>
								</Col>
							}
						</GameOnly>
						<GameOnly game={['csgo', 'dota2']}>
							<Col md="12" className="config-entry">
								<div className="config-description">
									GameState Integration: {gsi?.message || 'Loaded succesfully'}
								</div>
								<div
									className={`button empty strong wide green ${
										gsi?.loading || gsi?.success || !gsi?.accessible ? 'disabled' : ''
									}`}
									onClick={this.createGSI}
								>
									Add GSI file
								</div>
							</Col>
							<GameOnly game="csgo">
								<Col md="12" className="config-entry">
									<div className="config-description">
										Configs: {cfg?.message || 'Loaded succesfully'}
									</div>
									<div
										className={`button empty strong wide green ${
											cfg?.loading || cfg?.success || !cfg?.accessible ? 'disabled' : ''
										}`}
										onClick={this.createCFG}
									>
										Add config files
									</div>
								</Col>
							</GameOnly>
						</GameOnly>

						<GameOnly game="rocketleague">
							<Col md="12" className="config-entry">
								<div className="config-description">
									<p>Rocket League integration: {this.getBakkesModStatusDescription()}</p>
									{this.state.bakkesModAutoconfError && <p>[{this.state.bakkesModAutoconfError}]</p>}
								</div>
								<div className="download-container">
									<div
										className={`button empty strong wide green ${
											this.state.bakkesModAutoconfBusy ? 'disabled' : ''
										}`}
										onClick={
											!this.state.bakkesModAutoconfBusy
												? () => this.loadBakkesModStatus()
												: undefined
										}
									>
										Refresh
									</div>
									<div
										className={`button empty strong wide green ${
											this.state.bakkesModAutoconfBusy || this.state.bakkesModStatus.sosConfigSet
												? 'disabled'
												: ''
										}`}
										onClick={
											!(
												this.state.bakkesModAutoconfBusy ||
												this.state.bakkesModStatus.sosConfigSet
											)
												? this.installRLIntegration
												: undefined
										}
									>
										Install
									</div>
								</div>
							</Col>
						</GameOnly>
						<Col md="12" className="config-entry">
							<div className="config-description">Credits</div>
							<div
								className="button empty strong wide green"
								onClick={() => this.props.toggle('credits')}
							>
								See now
							</div>
						</Col>
						<ElectronOnly>
							<GameOnly game="csgo">
								<Col md="12" className="config-entry">
									<div className="config-description">Downloads</div>
									<div className="download-container">
										<div
											onClick={() => this.download('gsi')}
											className="button empty strong wide green"
										>
											GSI config
										</div>
										<div
											onClick={() => this.download('cfgs')}
											className="button empty strong wide green"
										>
											HUD configs
										</div>
										<div
											onClick={() => this.download('db')}
											className="button empty strong wide green"
										>
											Export DB
										</div>
									</div>
								</Col>
							</GameOnly>
						</ElectronOnly>
						<Col md="12" className="config-entry">
							<div className="config-description">Import</div>
							<DragInput
								id="import_file"
								label="Import database"
								accept=".json"
								onChange={this.importCheck(cxt.reload)}
								className="path_selector"
							/>
						</Col>
						<Col md="12" className="config-entry">
							<div className="config-description">Reader Code</div>
							<p>
								{ip
									.split('.')
									.map(Number)
									.map(n => n.toString(16))
									.join('-')}
								-{config.port.toString(16)}
							</p>
						</Col>
					</Row>
					{/*<Toast isOpen={this.state.restartRequired} className="fixed-toast">
                        <ToastHeader>Change of port detected</ToastHeader>
                        <ToastBody>It seems like you've changed GSI port - for all changes to be set in place you should now restart the Manager and update the GSI files</ToastBody>
                    </Toast>*/}
				</div>
				<div className="action-container">
					<div className="button green strong big wide" onClick={this.save}>
						{t('common.save')}
					</div>
				</div>
			</>
		);
	}
}

export default withTranslation()(Config);
