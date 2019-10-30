import React from 'react';
import {TabContent, TabPane} from "reactstrap";
import Teams from "./Teams/Teams";
import Players from "./Players/Players";
import Match from "./Match/Match";
import Huds from "./Huds/Huds";
import Config from "./Config/Config";
import Credits from "./Credits/Credits";
import { ContextData } from './../../Context';

export default class Tabs extends React.Component<{ activeTab: string}> {
    render() {
        const { Consumer } = ContextData;
        return (
            <Consumer>
                {
                    data => <TabContent activeTab={this.props.activeTab}>
                                <TabPane tabId="teams" style={{ padding: '20px' }}>
                                    <Teams cxt={data}></Teams>
                                </TabPane>
                                <TabPane tabId="players" style={{ padding: '20px' }}>
                                    <Players cxt={data}></Players>
                                </TabPane>
                                <TabPane tabId="create_match" style={{ padding: '20px' }}>
                                    <Match cxt={data}></Match>
                                </TabPane>
                                <TabPane tabId="huds" style={{ padding: '20px' }}>
                                    <Huds cxt={data}></Huds>
                                </TabPane>
                                <TabPane tabId="config" style={{ padding: '20px' }}>
                                    <Config cxt={data}></Config>
                                </TabPane>
                                <TabPane tabId="credits" style={{ padding: '20px' }}>
                                    <Credits></Credits>
                                </TabPane>
                            </TabContent>
                }
            </Consumer>
            
        );
    }
}
