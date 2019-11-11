import React from 'react';
import {TabContent, TabPane} from "reactstrap";
import Teams from "./Teams/Teams";
import Players from "./Players/Players";
import Matches from "./Match/Matches";
import Huds from "./Huds/Huds";
import Config from "./Config/Config";
import Credits from "./Credits/Credits";
import Live from "./Live/Live";
import { ContextData } from './../../Context';

export default class Tabs extends React.Component<{ activeTab: string, data: any, toggle: Function}> {
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
                                    <Players cxt={data} data={this.props.data}></Players>
                                </TabPane>
                                <TabPane tabId="create_match" style={{ padding: '20px' }}>
                                    <Matches cxt={data}></Matches>
                                </TabPane>
                                <TabPane tabId="huds" style={{ padding: '20px' }}>
                                    <Huds cxt={data}></Huds>
                                </TabPane>
                                <TabPane tabId="live" style={{ padding: '20px' }}>
                                    <Live toggle={this.props.toggle}></Live>
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
