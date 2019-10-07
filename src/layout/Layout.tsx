import React from 'react';

import Header from '../components/Header/Header';
import Content from "../components/Content/Content";
import { ContextData, IContextData } from './../components/Context';
import * as I from './../api/interfaces';
import api from './../api/api';

export default class Layout extends React.Component<any, {data: IContextData}> {
    constructor(props: any){
        super(props);
        this.state = {
            data:{
                teams: [],
                players: [],
                reload: async () => new Promise(async (res, rej) => {
                     await this.loadPlayers();
                     await this.loadTeams();
                     res();
                })
            }
        }
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
    render() {
        const { Provider } = ContextData;
        return (
            <Provider value={this.state.data}>
                <Header/>
                <Content/>
            </Provider>
        )
    }
}
