import Content from '../components/Content/Content';
import { ContextData, IContextData } from './../components/Context';
import api, { layoutEvents } from './../api/api';
import * as I from './../api/interfaces';
import config from './../api/config';
import { socket } from './../components/Content/Tabs/Live/Live';
import LoginRegisterModal from './LoginRegisterModal';
//import ElectronOnly from './../components/ElectronOnly';
import { hash } from '../hash';
import GamePicker from './GamePicker';
import { AvailableGames, CloudSyncStatus } from '../../types/interfaces';
import SyncModal from './SyncModal';
import Changelog from './ChangelogModal';
import { Component } from 'react';
import { canUserUseCloudStorage } from '../utils';
import WorkspaceModal from './WorkspaceModal';
// import WindowBar from '../WindowBar';

const isElectron = config.isElectron;

interface IState {
	data: IContextData;
	loading: boolean;
	loadingLogin: boolean;
	loginError: string;
	version: string;
	picked: null | AvailableGames;
	synchronizationStatus: CloudSyncStatus | null;
	isSyncModalOpen: boolean;
	config: I.ExtendedConfig | null;
}
export default class Layout extends Component<{}, IState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			data: {
				teams: [],
				players: [],
				matches: [],
				spaceUsed: 0,
				tournaments: [],
				reload: () => {
					return Promise.all([
						this.loadPlayers(),
						this.loadTeams(),
						this.loadMatch(),
						this.loadTournaments(),
						this.getCustomFields(),
						this.loadConfig(),
						this.getSpaceUsed()
					]).then(this.rehash);
				},
				fields: { players: [], teams: [] },
				hash: '',
				game: 'csgo',
				workspaces: [],
				workspace: null
			},
			loginError: '',
			loadingLogin: false,
			loading: true,
			version: '-',
			picked: null,
			synchronizationStatus: null,
			isSyncModalOpen: false,
			config: null
		};
	}
	getSpaceUsed = async () => {
		const response = await api.cloud.size();
		if (!response) return;
		const { data } = this.state;
		data.spaceUsed = response.size;
		this.setState({ data });
	};
	async componentDidMount() {
		//const socket = io.connect(`${config.isDev ? config.apiAddress : '/'}`);
		await this.loadUser(true);
		/*api.games.getCurrent().then(result => {
			const { data } = this.state;
			data.game = result.game;
			this.setState(
				{
					loadingGame: false,
					picked: result.game,
					data
				},
				() => {
					if (result.init) {
						this.sync();
					}
				}
			);
		});*/
		await this.getVersion();
		socket.on('match', (fromVeto?: boolean) => {
			if (fromVeto) this.loadMatch();
		});
		socket.on('banned', () => {
			this.logout();
		});
		socket.on('db_update', this.state.data.reload);

		socket.on('config', () => {
			this.loadConfig();
			this.getSpaceUsed();
		});
	}
	loadConfig = async () => {
		const cfg = await api.config.get();

		this.setState({ config: cfg });
	};
	setSyncOpen = (sync: boolean) => {
		this.setState({ isSyncModalOpen: sync });
	};
	rehash = () => {
		this.setState(state => {
			state.data.hash = hash();
			return state;
		});
	};
	setGame = (game: AvailableGames, init = false) => {
		const { data } = this.state;
		data.game = game;
		this.setState({ picked: game, data }, () => {
			this.sync(init);
			layoutEvents.emit('gameChange');
		});
	};
	clearGame = () => {
		this.setState({ picked: null });
	};
	sync = (init = false) => {
		if (!this.state.picked) return;
		api.games.startServices(this.state.picked).then(response => {
			this.setState({ synchronizationStatus: response.result });
			this.setSyncOpen(response.result !== 'ALL_SYNCED');
			if (response.result === 'ALL_SYNCED') {
				this.state.data.reload();
			}
			if (init) this.loadUser();
		});
	};
	getCustomFields = async () => {
		const [teams, players] = await Promise.all([api.teams.fields.get(), api.players.fields.get()]);
		this.setState(state => {
			state.data.fields = { teams, players };
			return state;
		});
	};
	getVersion = async () => {
		const response = await api.config.getVersion();
		this.setState({ version: response.version });
		return response.version;
	};
	loadUser = async (init = false) => {
		try {
			const appLoadedUser = await api.user.getCurrent();
			if ('message' in appLoadedUser) {
				this.setLoading(false, appLoadedUser.message);
				this.setUser(null);
				return this.setState({ loading: false });
			}
			const { session, ...user } = appLoadedUser;
			this.setUser(user);
			let forceInit = false;
			if(user.customer && user.workspaces?.length === 1){
				forceInit = true;
			}
			return this.setState({ loading: false }, async () => {
				if (!init && !forceInit) return;
				if (session.game !== null) {
					const workspaceResult = await api.user.setWorkspace(session.workspace);
					if (!workspaceResult.success) return;

					this.setGame(session.game, !forceInit);
				}
			});
		} catch {
			this.setUser(null);
			return this.setState({ loading: false });
		}
	};
	setUser = (customerData: I.CustomerData | null) => {
		const { data } = this.state;
		data.customer = customerData?.customer || undefined;
		data.workspaces = customerData?.workspaces || [];
		data.workspace = customerData?.workspace || null;
		this.setState({ data });
	};
	loadTeams = async () => {
		const teams = await api.teams.get();
		if (!teams) return;
		const { data } = this.state;
		data.teams = teams;
		if (teams) {
			this.setState({ data });
		}
	};
	loadPlayers = async () => {
		const players = await api.players.get();
		if (!players) return;
		const { data } = this.state;
		data.players = players;
		this.setState({ data });
	};
	loadMatch = async () => {
		const matches = await api.match.get();
		if (!matches) return;
		const { data } = this.state;
		data.matches = matches;
		if (matches) {
			this.setState({ data });
		}
	};
	loadTournaments = async () => {
		const tournaments = await api.tournaments.get();
		const { data } = this.state;
		data.tournaments = tournaments;
		if (tournaments) {
			this.setState({ data });
		}
	};
	logout = async () => {
		await api.user.logout();
		this.loadUser();
	};
	setLoading = (loading: boolean, loginError?: string) => {
		this.setState({ loadingLogin: loading, loginError: loginError || '' });
	};
	toggleSync = async () => {
		const cfg = await api.config.get();
		cfg.sync = !cfg.sync;

		await api.config.update(cfg);
		await this.loadConfig();
		this.sync();
	};
	render() {
		const { Provider } = ContextData;
		const { loading, data, loadingLogin, loginError, version, isSyncModalOpen, synchronizationStatus, config } =
			this.state;
		const { workspace, workspaces, game, customer } = data;

		const available = canUserUseCloudStorage({ workspace, workspaces, game, customer: customer || null });
		const active = Boolean(available && config?.sync);
		// const url = new URL(window.location.href);
		// const isHLAEGUI = url.searchParams.get('hlaegui');
		return (
			<Provider value={this.state.data}>
				{/*isHLAEGUI === null ? <WindowBar /> : null*/}
				<div className={`loaded ${isElectron ? 'electron' : ''}`}>
					{/*data.customer ? (
						<div className={`license-status ${isElectron ? 'electron' : ''}`}>
							{data.customer.license.type}
							<ElectronOnly>
								<div className="logout-button" onClick={this.logout}>
									Logout
								</div>
							</ElectronOnly>
						</div>
					) : null*/}
					{<div className={`loading-container ${loading ? '' : 'hide'}`}>Loading...</div>}
					<LoginRegisterModal
						isOpen={!data.customer}
						loading={loadingLogin}
						setLoading={this.setLoading}
						loadUser={this.loadUser}
						error={loginError}
					/>
					<WorkspaceModal
						workspaces={data.workspaces}
						isOpen={!data.customer && data.workspaces.length > 1}
						loadUser={this.loadUser}
					/>
					<SyncModal
						isOpen={isSyncModalOpen}
						setOpen={this.setSyncOpen}
						syncStatus={synchronizationStatus}
						reload={this.state.data.reload}
					/>
					{version !== '-' ? <Changelog version={version} customer={data.customer} /> : null}
					<GamePicker isOpen={Boolean(data.customer && !this.state.picked)} setGame={this.setGame} />
					<Content
						active={active}
						available={available}
						toggleSync={this.toggleSync}
						clearGame={this.clearGame}
						loadUser={this.loadUser}
						game={this.state.data.game}
						customer={data.customer}
						logout={this.logout}
						version={version}
					/>
				</div>
			</Provider>
		);
	}
}
