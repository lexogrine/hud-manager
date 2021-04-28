import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import Teams from './Teams/Teams';
import Players from './Players/Players';
import Matches from './Match/Matches';
import Huds from './Huds/Huds';
import Tournaments from './Tournaments/Tournaments';
import Config from './Config/Config';
import AR from './AR/AR';
import Credits from './Credits/Credits';
import Live from './Live/Live';
import { ContextData } from './../../Context';
import ACO from './ACO/ACO';

interface IProps {
	activeTab: string;
	data: any;
	toggle: (tab: string, data?: any) => void;
	gsiCheck: Function;
}

const Tabs = ({ activeTab, data, toggle, gsiCheck }: IProps) => (
	<ContextData.Consumer>
		{cxt => (
			<TabContent activeTab={activeTab}>
				<TabPane tabId="teams">
					<Teams cxt={cxt}></Teams>
				</TabPane>
				<TabPane tabId="players">
					<Players cxt={cxt} data={data}></Players>
				</TabPane>
				<TabPane tabId="create_match">
					<Matches cxt={cxt}></Matches>
				</TabPane>
				<TabPane tabId="huds">
					<Huds cxt={cxt} toggle={toggle}></Huds>
				</TabPane>
				<TabPane tabId="tournaments">
					<Tournaments cxt={cxt}></Tournaments>
				</TabPane>
				<TabPane tabId="live">
					<Live toggle={toggle} cxt={cxt}></Live>
				</TabPane>
				<TabPane tabId="config">
					<Config cxt={cxt} toggle={toggle} gsiCheck={gsiCheck}></Config>
				</TabPane>
				<TabPane tabId="ar">
					<AR cxt={cxt} toggle={toggle} huds={data}></AR>
				</TabPane>
				<TabPane tabId="aco">
					<ACO cxt={cxt} toggle={toggle}></ACO>
				</TabPane>
				<TabPane tabId="credits">
					<Credits></Credits>
				</TabPane>
			</TabContent>
		)}
	</ContextData.Consumer>
);

export default Tabs;
