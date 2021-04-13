import React from 'react';
import Content from '../components/Content/Content';
import { ContextData, IContextData } from './../components/Context';
import api from './../api/api';
import * as I from './../api/interfaces';
import config from './../api/config';
import { socket } from './../components/Content/Tabs/Live/Live';
import LoginRegisterModal from './LoginRegisterModal';
import ElectronOnly from './../components/ElectronOnly';
import { hash } from '../hash';
import GamePicker from './GamePicker';
import { AvailableGames } from '../../types/interfaces';

declare let window: any;
const isElectron = config.isElectron;
const fakeRequire = () => ({ ipcRenderer: null });
if (!isElectron) {
	window.require = fakeRequire;
}

interface IState {
	data: IContextData;
	loading: boolean;
	loadingLogin: boolean;
	loadingGame: boolean;
	loginError: string;
	version: string;
	picked: null | AvailableGames;
}
export default class Layout extends React.Component<{}, IState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			data: {
				teams: [],
				players: [],
				matches: [],
				tournaments: [],
				reload: () => {
					return Promise.all([
						this.loadPlayers(),
						this.loadTeams(),
						this.loadMatch(),
						this.loadTournaments(),
						this.getCustomFields()
					]).then(this.rehash);
				},
				fields: { players: [], teams: [] },
				hash: '',
				game: 'csgo'
			},
			loginError: '',
			loadingLogin: false,
			loading: true,
			loadingGame: true,
			version: '-',
			picked: null
		};
	}
	async componentDidMount() {
		//const socket = io.connect(`${config.isDev ? config.apiAddress : '/'}`);
		api.games.getCurrent().then(result => {
			this.setState({
				loadingGame: false,
				picked: result.game
			})
		});
		await this.getVersion();
		this.loadUser();
		socket.on('match', (fromVeto?: boolean) => {
			if (fromVeto) this.loadMatch();
		});
	}
	rehash = () => {
		this.setState(state => {
			state.data.hash = hash();
			return state;
		});
	};
	setGame = (game: AvailableGames) => {
		this.setState({ picked: game }, () => {
			api.games.startServices(game).then(response => {
				if(response.result === "ALL_SYNCED"){
					this.state.data.reload();
				}
				// TODO: Add handlers for the rest of the events
			})
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
	loadUser = async () => {
		try {
			const appLoadedUser = await api.user.getCurrent();
			if ('message' in appLoadedUser) {
				this.setLoading(false, appLoadedUser.message);
				this.setUser();
				return this.setState({ loading: false });
			}
			this.setUser(appLoadedUser);
			return this.setState({ loading: false });
		} catch {
			this.setUser();
			return this.setState({ loading: false });
		}
	};
	setUser = (user?: I.Customer) => {
		const { data } = this.state;
		data.customer = user;
		this.setState({ data });
	};
	loadTeams = async () => {
		const teams = await api.teams.get();
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
	render() {
		const { Provider } = ContextData;
		const { loading, data, loadingLogin, loginError, version, loadingGame } = this.state;
		return (
			<Provider value={this.state.data}>
				<div className={`loaded ${isElectron ? 'electron' : ''}`}>
					{data.customer ? (
						<div className={`license-status ${isElectron ? 'electron' : ''}`}>
							{data.customer.license.type} {version}
							<ElectronOnly>
								<div className="logout-button" onClick={this.logout}>
									Logout
								</div>
							</ElectronOnly>
						</div>
					) : null}
					{<div className={`loading-container ${loading || loadingGame ? '' : 'hide'}`}>Loading...</div>}
					<LoginRegisterModal
						isOpen={!data.customer}
						loading={loadingLogin}
						setLoading={this.setLoading}
						loadUser={this.loadUser}
						error={loginError}
					/>
					<GamePicker isOpen={Boolean(data.customer && !this.state.picked)} setGame={this.setGame} />
					<Content />
				</div>
			</Provider>
		);
	}
}
