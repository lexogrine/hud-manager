import React from 'react';
import Content from "../components/Content/Content";
import { ContextData, IContextData } from './../components/Context';
import api from './../api/api';

import { socket } from './../components/Content/Tabs/Live/Live';

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
    render() {
        const { Provider } = ContextData;
        return (
            <Provider value={this.state.data}>
                <div className={`loaded`}>
                    <Content/>
                </div>
            </Provider>
        )
    }
}
