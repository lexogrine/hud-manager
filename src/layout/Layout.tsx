import React from 'react';
import Content from "../components/Content/Content";
import { ContextData, IContextData } from './../components/Context';
import api from './../api/api';
import config from './../api/config';
import { socket } from './../components/Content/Tabs/Live/Live';
declare let window: any;
const isElectron = config.isElectron;
const fakeRequire = () => ({remote:null});
if(!isElectron){
    window.require = fakeRequire;
}
const { remote } = window.require("electron");

export default class Layout extends React.Component<any, {data: IContextData}> {
    constructor(props: any){
        super(props);
        this.state = {
            data:{
                teams: [],
                players: [],
                matches: [],
                reload: async () => new Promise(async (res, rej) => {
                     await this.loadPlayers();
                     await this.loadTeams();
                     await this.loadMatch();
                     res();
                })
            }
        }
    }
    componentDidMount(){
        //const socket = io.connect(`${config.isDev ? config.apiAddress : '/'}`);
        socket.on('match', (fromVeto?: boolean) => {
            if(fromVeto) this.loadMatch();
        });
        socket.on('devHUD', (status: boolean) => {console.log(status)})
    }
    loadTeams = async () => {
        const teams = await api.teams.get();
        const { data } = this.state;
        data.teams = teams;
        if(teams){
            this.setState({data});
        }
    }
    loadPlayers = async () => {
        const players = await api.players.get();
        const { data } = this.state;
        data.players = players;
        if(players){
            this.setState({data});
        }
    }
    loadMatch = async () => {
        const matches = await api.match.get();
        const { data } = this.state;
        data.matches = matches;
        if(matches){
            this.setState({data});
        }
    }
    minimize = () => {
        if(!remote) return;
        remote.getCurrentWindow().minimize();
    }
    maximize = () => {
        if(!remote) return;
        if(remote.getCurrentWindow().isMaximized()){
            remote.getCurrentWindow().restore();
        } else {
            remote.getCurrentWindow().maximize();
        }
    }
    close = () => {
        if(!remote) return;
        remote.getCurrentWindow().close();
    }
    render() {
        const { Provider } = ContextData;
        return (
            <Provider value={this.state.data}>
                <div className={`loaded ${isElectron ? 'electron' : ''}`}>
                    <div className="window-bar">
                        <div className="window-drag-bar"></div>
                        <div onClick={this.minimize} className="app-control minimize"></div>
                        <div onClick={this.maximize} className="app-control maximize"></div>
                        <div onClick={this.close} className="app-control close"></div>
                    </div>
                    <Content/>
                </div>
            </Provider>
        )
    }
}
