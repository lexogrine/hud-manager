import React from 'react';

import Header from '../components/Header/Header';
import Content from "../components/Content/Content";
import { ContextData, IContextData } from './../components/Context';
import * as I from './../api/interfaces';
import api from './../api/api';
import config from './../api/config';
import io from 'socket.io-client';
import logoWhite from './../styles/logo-white.png';

import { socket } from './../components/Content/Tabs/Live/Live';
class LoadingScreen extends React.Component {
    render(){
        return <div className="loading-screen">
            <div className="title-container"><img src={logoWhite} height="100px" /><h2 className="loading-title">HUD Manager</h2></div>
        </div>
    }
}


export default class Layout extends React.Component<any, {data: IContextData, loaded: boolean}> {
    constructor(props: any){
        super(props);
        this.state = {
            loaded: false,
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
            this.setState({data}, () => {
                if(!this.state.loaded){
                    this.setState({loaded: true});
                }
            });
        }
    }
    render() {
        const { Provider } = ContextData;
        return (
            <Provider value={this.state.data}>
                <div className={`${this.state.loaded ? 'loaded' : 'loading'}`}>
                    <LoadingScreen />
                    <Header/>
                    <Content/>
                </div>
            </Provider>
        )
    }
}
