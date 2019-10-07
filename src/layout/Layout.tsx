import React from 'react';

import Header from '../components/Header/Header';
import Content from "../components/Content/Content";
import { ContextData } from './../components/Context';
import * as I from './../api/interfaces';

export default class Layout extends React.Component<any, {data: {teams:I.Team[], players: I.Player[]}}> {
    constructor(props: any){
        super(props);
        this.state = {
            data:{
                teams: [],
                players: []
            }
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
