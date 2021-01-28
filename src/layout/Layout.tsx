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

declare let window: any;
const isElectron = config.isElectron;
const fakeRequire = () => ({ ipcRenderer: null });
if (!isElectron) {
	window.require = fakeRequire;
}
const { ipcRenderer } = window.require('electron');

interface IState {
	data: IContextData;
	loading: boolean;
	loadingLogin: boolean;
	loginError: string;
	version: string;
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
						this.loadTournaments()
					]).then(this.rehash);
				},
				hash: ''
			},
			loginError: '',
			loadingLogin: false,
			loading: true,
			version: '-'
		};
	}
	async componentDidMount() {
		//const socket = io.connect(`${config.isDev ? config.apiAddress : '/'}`);
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
	getVersion = async () => {
		const response = await api.config.getVersion();
		this.setState({ version: response.version });
		return response.version;
	};
	loadUser = async () => {
		try {
			const appLoadedUser = await api.user.getCurrent();
			if (appLoadedUser) {
				this.setUser(appLoadedUser);
				return this.setState({ loading: false });
			}

			const machine = await api.machine.get();

			const user = await api.user.get(machine.id);
			if (!user) return this.setState({ loading: false }, () => this.setUser());

			if ('error' in user) {
				return this.setState({ loading: false, loginError: user.error }, () => this.setUser());
			}

			const userData = await api.user.verify(user.token);
			if (!userData)
				return this.setState(
					{
						loading: false,
						loginError: 'It seems that your session has expired - please restart & login again'
					},
					() => this.setUser()
				);
			this.setUser(userData);
			this.setState({ loading: false });
		} catch {
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
	minimize = () => {
		if (!ipcRenderer) return;
		ipcRenderer.send('min');
	};
	maximize = () => {
		if (!ipcRenderer) return;
		ipcRenderer.send('max');
	};
	logout = async () => {
		await api.user.logout();
		this.loadUser();
	};
	close = () => {
		if (!ipcRenderer) return;
		ipcRenderer.send('close');
	};
	setLoading = (loading: boolean, loginError?: string) => {
		this.setState({ loadingLogin: loading, loginError: loginError || '' });
	};
	render() {
		const { Provider } = ContextData;
		const { loading, data, loadingLogin, loginError, version } = this.state;
		return (
			<Provider value={this.state.data}>
				<div className={`loaded ${isElectron ? 'electron' : ''}`}>
					<div className="window-bar">
						<div className="window-drag-bar">
							<div className="title-bar">Lexogrine HUD Manager</div>
						</div>
						<div onClick={this.minimize} className="app-control minimize"></div>
						<div onClick={this.maximize} className="app-control maximize"></div>
						<div onClick={this.close} className="app-control close"></div>
					</div>
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
					{<div className={`loading-container ${loading ? '' : 'hide'}`}>Loading...</div>}
					<LoginRegisterModal
						isOpen={!data.customer}
						loading={loadingLogin}
						setLoading={this.setLoading}
						setUser={this.setUser}
						error={loginError}
						version={version}
					/>
					<Content />
				</div>
			</Provider>
		);
	}
}
