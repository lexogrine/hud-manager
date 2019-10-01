import React from 'react';
import {TabContent, TabPane} from "reactstrap";
import Teams from "./Teams/Teams";
import Players from "./Players/Players";
import Match from "./Match/Match";
import Huds from "./Huds/Huds";

export default class Tabs extends React.Component<{ activeTab: string}> {
    render() {
        return (
            <TabContent activeTab={this.props.activeTab}>
                <TabPane tabId="teams" style={{ padding: '20px' }}>
                    <Teams></Teams>
                </TabPane>
                <TabPane tabId="players" style={{ padding: '20px' }}>
                    <Players></Players>
                </TabPane>
                <TabPane tabId="create_match" style={{ padding: '20px' }}>
                    <Match></Match>
                </TabPane>
                <TabPane tabId="huds" style={{ padding: '20px' }}>
                    <Huds></Huds>
                </TabPane>
            </TabContent>
        );
    }
}
