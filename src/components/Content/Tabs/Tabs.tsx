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
import Cameras from './Cameras';
import ForPlansOnly from '../../ForPlansOnly';
import { useEffect, useState } from 'react';
import api from '../../../api/api';

interface IProps {
	activeTab: string;
	data: any;
	toggle: (tab: string, data?: any) => void;
	gsiCheck: Function;
	setOnBackClick: HeaderHandler;
}

const Tabs = ({ activeTab, data, toggle, gsiCheck, setOnBackClick }: IProps) => {
	const [maps, setMaps] = useState<string[]>([]);

	useEffect(() => {
		api.match.getMaps().then(maps => {
			setMaps(maps);
		});
	}, []);
	return (
		<ContextData.Consumer>
			{cxt => (
				<TabContent activeTab={activeTab}>
					<TabPane tabId="cgpanel">
						<ForPlansOnly required="personal">
							<CG cxt={cxt}></CG>
						</ForPlansOnly>
					</TabPane>
					<TabPane tabId="teams">
						<Teams cxt={cxt}></Teams>
					</TabPane>
					<TabPane tabId="players">
						<Players cxt={cxt} data={data}></Players>
					</TabPane>
					<TabPane tabId="matches">
						<Matches maps={maps} cxt={cxt} setOnBackClick={setOnBackClick}></Matches>
					</TabPane>
					<TabPane tabId="huds">
						<Huds cxt={cxt} toggle={toggle} setOnBackClick={setOnBackClick}></Huds>
					</TabPane>
					<TabPane tabId="tournaments">
						<Tournamentss maps={maps} cxt={cxt} setOnBackClick={setOnBackClick}></Tournamentss>
					</TabPane>
					<TabPane tabId="arg">
						<ForPlansOnly required="personal">
							<ARG></ARG>
						</ForPlansOnly>
					</TabPane>
					<TabPane tabId="live">
						<Live toggle={toggle} cxt={cxt}></Live>
					</TabPane>
					<TabPane tabId="settings">
						<Config cxt={cxt} toggle={toggle} gsiCheck={gsiCheck}></Config>
					</TabPane>
					<TabPane tabId="ar">
						<AR cxt={cxt} toggle={toggle} setOnBackClick={setOnBackClick}></AR>
					</TabPane>
					<TabPane tabId="aco">
						<ForPlansOnly required="professional">
							<ACO></ACO>
						</ForPlansOnly>
					</TabPane>
					<TabPane tabId="cameras">
						<ForPlansOnly required="personal">
							<Cameras cxt={cxt} />
						</ForPlansOnly>
					</TabPane>
					<TabPane tabId="credits">
						<Credits></Credits>
					</TabPane>
				</TabContent>
			)}
		</ContextData.Consumer>
	);
};

export default Tabs;
