import React from 'react';
import { Form, FormGroup, Input, Row, Col, Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import api from './../../../../api/api';
import config from './../../../../api/config';
import DragInput from './../../../DragFileInput';
import ImportModal from './ImportModal';
import { IContextData } from '../../../Context';
import ElectronOnly from '../../../ElectronOnly';

const { isElectron } = config;

interface ConfigStatus extends I.CFGGSIResponse {
	loading: boolean;
}

interface ExtendedFile extends File {
	path?: string;
}

interface IProps {
	cxt: IContextData;
	toggle: Function;
	gsiCheck: Function;
}

interface IState {
	config: I.Config;
	cfg: ConfigStatus;
	gsi: ConfigStatus;
	restartRequired: boolean;
	importModalOpen: boolean;
	conflict: {
		teams: number;
		players: number;
	};
	update: {
		available: boolean;
		installing: boolean;
	};
	ip: string;
	data: any;
}

export default class Config extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			config: {
				steamApiKey: '',
				port: 1349,
				token: '',
				hlaePath: '',
				afxCEFHudInteropPath: ''
			},
			cfg: {
				success: false,
				loading: true,
				message: 'Loading data about cfg files...',
				accessible: true
			},
			gsi: {
				success: false,
				loading: true,
				message: 'Loading data about GameState files...',
				accessible: true
			},
			importModalOpen: false,
			restartRequired: false,
			conflict: {
				teams: 0,
				players: 0
			},
			update: {
				available: false,
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
		if (!file.path || file.type !== 'application/json') return;
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
		const { gsi } = this.state;
		gsi.message = 'Loading GameState data...';

		this.setState({ gsi });
		await api.gamestate.create();
		this.checkGSI();
		this.props.gsiCheck();
	};
	createCFG = async () => {
		const { cfg } = this.state;
		cfg.message = 'Loading GameState file data...';

		this.setState({ cfg });
		await api.cfgs.create();
		this.checkCFG();
		this.props.gsiCheck();
	};
	checkGSI = async () => {
		const { gsi } = this.state;
		gsi.message = 'Loading GameState file data...';

		this.setState({ gsi });

		const response = await api.gamestate.check();

		if (response.success === false) {
			return this.setState({
				gsi: {
					success: false,
					message: response.message,
					loading: false,
					accessible: response.accessible
				}
			});
		}
		return this.setState({
			gsi: { success: true, loading: false, accessible: true }
		});
	};
	checkCFG = async () => {
		const { cfg } = this.state;
		cfg.message = 'Loading config file data...';

		this.setState({ cfg });

		const response = await api.cfgs.check();

		if (response.success === false) {
			return this.setState({
				cfg: {
					success: false,
					message: response.message,
					loading: false,
					accessible: response.accessible
				}
			});
		}
		return this.setState({
			cfg: { success: true, loading: false, accessible: true }
		});
	};

	async componentDidMount() {
		this.getConfig();
		this.checkCFG();
		this.checkGSI();
		this.checkUpdate();
	}
	checkUpdate = () => {
		if (!isElectron) return;
		const { ipcRenderer } = window.require('electron');
		ipcRenderer.on('updateStatus', (e: any, data: boolean) => {
			this.setState(state => {
				state.update.available = data;
				return state;
			});
		});

		ipcRenderer.send('checkUpdate');
	};
	installUpdate = () => {
		if (!isElectron) return;
		const { ipcRenderer } = window.require('electron');
		this.setState(
			state => {
				state.update.installing = true;
				return state;
			},
			() => {
				ipcRenderer.send('updateApp');
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
		const { cxt } = this.props;
		const { gsi, cfg, importModalOpen, conflict, data, ip, config, update } = this.state;
		return (
			<Form>
				<div className="tab-title-container">Settings</div>
				<div className="tab-content-container no-padding">
					<ImportModal
						isOpen={importModalOpen}
						toggle={this.toggleModal}
						teams={conflict.teams}
						players={conflict.players}
						save={this.import(data, cxt.reload)}
					/>
					<Row className="padded base-config">
						<Col md="4">
							<FormGroup>
								<Input
									type="text"
									name="steamApiKey"
									id="steamApiKey"
									onChange={this.changeHandler}
									value={this.state.config.steamApiKey}
									placeholder="Steam API Key"
								/>
							</FormGroup>
						</Col>
						<Col md="4">
							<FormGroup>
								<Input
									type="number"
									name="port"
									id="port"
									onChange={this.changeHandler}
									value={this.state.config.port}
									placeholder="GSI Port"
								/>
							</FormGroup>
						</Col>
						<Col md="4">
							<FormGroup>
								<Input
									type="text"
									name="token"
									id="token"
									onChange={this.changeHandler}
									value={this.state.config.token}
									placeholder="GSI Token"
								/>
							</FormGroup>
						</Col>
					</Row>
					<Row className="config-container bottom-margin">
						<ElectronOnly>
							<Col md="12" className="config-entry">
								<div className="config-description">Version</div>
								<Button
									className="purple-btn round-btn"
									disabled={update.installing || !update.available}
									onClick={this.installUpdate}
								>
									{update.installing
										? 'Installing...'
										: update.available
										? 'Install update'
										: 'Latest'}
								</Button>
							</Col>
						</ElectronOnly>
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
						<Col md="12" className="config-entry">
							<div className="config-description">
								GameState Integration: {gsi.message || 'Loaded succesfully'}
							</div>
							<Button
								className="purple-btn round-btn"
								disabled={gsi.loading || gsi.success || !gsi.accessible}
								onClick={this.createGSI}
							>
								Add GSI file
							</Button>
						</Col>
						<Col md="12" className="config-entry">
							<div className="config-description">Configs: {cfg.message || 'Loaded succesfully'}</div>
							<Button
								className="purple-btn round-btn"
								disabled={cfg.loading || cfg.success || !cfg.accessible}
								onClick={this.createCFG}
							>
								Add config files
							</Button>
						</Col>
						<Col md="12" className="config-entry">
							<div className="config-description">Credits</div>
							<Button className="lightblue-btn round-btn" onClick={() => this.props.toggle('credits')}>
								See now
							</Button>
						</Col>
						{isElectron ? (
							<Col md="12" className="config-entry">
								<div className="config-description">Downloads</div>
								<div className="download-container">
									<Button onClick={() => this.download('gsi')} className="purple-btn round-btn">
										GSI config
									</Button>
									<Button onClick={() => this.download('cfgs')} className="purple-btn round-btn">
										HUD configs
									</Button>
									<Button onClick={() => this.download('db')} className="purple-btn round-btn">
										Export DB
									</Button>
								</div>
							</Col>
						) : null}
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
				<Row>
					<Col className="main-buttons-container">
						<Button onClick={this.save} color="primary">
							Save
						</Button>
					</Col>
				</Row>
			</Form>
		);
	}
}
