import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import Teams from './Teams/Teams';
import Players from './Players/Players';
import Matches from './Match/Matches';
import Huds from './Huds/Huds';
import Tournaments from './Tournaments/Tournaments';
import Config from './Config/Config';
import Credits from './Credits/Credits';
import Live from './Live/Live';
import { ContextData } from './../../Context';

interface IProps {
	activeTab: string;
	data: any;
	toggle: Function;
	gsiCheck: Function;
}

export default class Tabs extends React.Component<IProps> {
	render() {
		const { Consumer } = ContextData;
		return (
			<Consumer>
				{data => (
					<TabContent activeTab={this.props.activeTab}>
						<TabPane tabId="teams">
							<Teams cxt={data}></Teams>
						</TabPane>
						<TabPane tabId="players">
							<Players cxt={data} data={this.props.data}></Players>
						</TabPane>
						<TabPane tabId="create_match">
							<Matches cxt={data}></Matches>
						</TabPane>
						<TabPane tabId="huds">
							<Huds cxt={data}></Huds>
						</TabPane>
						<TabPane tabId="tournaments">
							<Tournaments cxt={data}></Tournaments>
						</TabPane>
						<TabPane tabId="live">
							<Live toggle={this.props.toggle} cxt={data}></Live>
						</TabPane>
						<TabPane tabId="config">
							<Config cxt={data} toggle={this.props.toggle} gsiCheck={this.props.gsiCheck}></Config>
						</TabPane>
						<TabPane tabId="credits">
							<Credits></Credits>
						</TabPane>
					</TabContent>
				)}
			</Consumer>
		);
	}
}
