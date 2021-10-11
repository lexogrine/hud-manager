import { TabContent, TabPane } from 'reactstrap';
import Teams from './Teams/Teams';
import Players from './Players/Players';
import Matches from './Match/Matches';
import Huds from './Huds/Huds';
import Config from './Config/Config';
import AR from './AR/AR';
import Credits from './Credits/Credits';
import Live from './Live/Live';
import { ContextData } from './../../Context';
import ACO from './ACO/ACO';
import CG from './CG/CG';
import ARG from './ARG/ARG';
import Tournamentss from './Tournaments/Tournamentss';
import { HeaderHandler } from '../../../api/interfaces';

interface IProps {
	activeTab: string;
	data: any;
	toggle: (tab: string, data?: any) => void;
	gsiCheck: Function;
	setOnBackClick: HeaderHandler
}

const Tabs = ({ activeTab, data, toggle, gsiCheck, setOnBackClick }: IProps) => (
	<ContextData.Consumer>
		{cxt => (
			<TabContent activeTab={activeTab}>
				<TabPane tabId="cgpanel">
					<CG cxt={cxt}></CG>
				</TabPane>
				<TabPane tabId="teams">
					<Teams cxt={cxt}></Teams>
				</TabPane>
				<TabPane tabId="players">
					<Players cxt={cxt} data={data}></Players>
				</TabPane>
				<TabPane tabId="create_match">
					<Matches cxt={cxt} setOnBackClick={setOnBackClick}></Matches>
				</TabPane>
				<TabPane tabId="huds">
					<Huds cxt={cxt} toggle={toggle}></Huds>
				</TabPane>
				<TabPane tabId="tournaments">
					<Tournamentss cxt={cxt} setOnBackClick={setOnBackClick}></Tournamentss>
				</TabPane>
				<TabPane tabId="arg">
					<ARG></ARG>
				</TabPane>
				<TabPane tabId="live">
					<Live toggle={toggle} cxt={cxt}></Live>
				</TabPane>
				<TabPane tabId="config">
					<Config cxt={cxt} toggle={toggle} gsiCheck={gsiCheck}></Config>
				</TabPane>
				<TabPane tabId="ar">
					<AR cxt={cxt} toggle={toggle}></AR>
				</TabPane>
				<TabPane tabId="aco">
					<ACO></ACO>
				</TabPane>
				<TabPane tabId="credits">
					<Credits></Credits>
				</TabPane>
			</TabContent>
		)}
	</ContextData.Consumer>
);

export default Tabs;
