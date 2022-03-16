import { TabContent, TabPane } from 'reactstrap';
import Teams from './Teams/Teams';
import Players from './Players/Players';
import Matches from './Match/Matches';
import Huds from './Huds/Huds';
import Config from './Config/Config';
import AR from './AR/AR';
import Credits from './Credits/Credits';
import Live from './Live/Live';
import { ContextData, IContextData } from './../../Context';
import ACO from './ACO/ACO';
import CG from './CG/CG';
import ARG from './ARG/ARG';
import Tournamentss from './Tournaments/Tournamentss';
import { HeaderHandler } from '../../../api/interfaces';
import Cameras from './Cameras';
import ForPlansOnly from '../../ForPlansOnly';
import { useEffect, useState } from 'react';
import api from '../../../api/api';
import XRay from './XRay';

interface IProps {
	activeTab: string;
	data: any;
	toggle: (tab: string, data?: any) => void;
	gsiCheck: Function;
	search: string;
	setOnBackClick: HeaderHandler;
}

const Tabs = ({ activeTab, data, toggle, gsiCheck, setOnBackClick, search }: IProps) => {
	const [maps, setMaps] = useState<string[]>([]);

	useEffect(() => {
		api.match.getMaps().then(maps => {
			setMaps(maps);
		});
	}, []);

	const getClassForTab = (tab: string, cxt: IContextData) => {
		if (!cxt.workspace || !cxt.customer) return '';

		if (cxt.workspace.id === 0 || cxt.customer.user.id === cxt.workspace.ownerId) return '';

		if (cxt.workspace.permissions.includes(tab)) return '';

		return 'unavailable';
	};
	return (
		<ContextData.Consumer>
			{cxt => (
				<TabContent activeTab={activeTab}>
					<TabPane tabId="cgpanel">
						<ForPlansOnly required="personal">
							<CG cxt={cxt}></CG>
						</ForPlansOnly>
					</TabPane>
					<TabPane tabId="teams" className={getClassForTab('Teams', cxt)}>
						<Teams cxt={cxt} search={search}></Teams>
					</TabPane>
					<TabPane tabId="players" className={getClassForTab('Players', cxt)}>
						<Players cxt={cxt} data={data} search={search}></Players>
					</TabPane>
					<TabPane tabId="matches" className={getClassForTab('Matches', cxt)}>
						<Matches maps={maps} cxt={cxt} setOnBackClick={setOnBackClick}></Matches>
					</TabPane>
					<TabPane tabId="huds" className={getClassForTab('HUDs', cxt)}>
						<Huds cxt={cxt} toggle={toggle} setOnBackClick={setOnBackClick}></Huds>
					</TabPane>
					<TabPane tabId="tournaments" className={getClassForTab('Tournaments', cxt)}>
						<Tournamentss maps={maps} cxt={cxt} setOnBackClick={setOnBackClick}></Tournamentss>
					</TabPane>
					<TabPane tabId="xray" className={getClassForTab('XRay', cxt)}>
						<XRay></XRay>
					</TabPane>
					<TabPane tabId="arg" className={getClassForTab('ARG', cxt)}>
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
					<TabPane tabId="ar" className={getClassForTab('AR', cxt)}>
						<AR cxt={cxt} toggle={toggle} setOnBackClick={setOnBackClick}></AR>
					</TabPane>
					<TabPane tabId="aco" className={getClassForTab('ACO', cxt)}>
						<ForPlansOnly required="personal">
							<ACO cxt={cxt}></ACO>
						</ForPlansOnly>
					</TabPane>
					<TabPane tabId="cameras" className={getClassForTab('Cameras', cxt)}>
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
