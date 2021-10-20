import { Nav, NavItem, NavLink } from 'reactstrap';
import * as Tabs from './TabIcons';
import { GameOnly } from '../Tabs/Config/Config';
import { useTranslation } from 'react-i18next';
//import { isCGMode } from '../Content';
import toggleIcon from './../../../styles/navbarToggle.png';
interface IProps {
	activeTab: string;
	toggle: (tab: string, data?: any) => void;
	files: boolean;
	isCollapsed: boolean;
	version: string;
	setCollapse: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar = ({ activeTab, toggle, files, setCollapse, isCollapsed, version }: IProps) => {
	const { t } = useTranslation();

	const toggleNav = () => {
		setCollapse(!isCollapsed);
	};

	const toggleHandler = (tab: string) => () => {
		toggle(tab);
	};

	return (
		<Nav tabs className={`navbar-container ${isCollapsed ? 'collapsed' : ''}`}>
			<div className="collapse-button" onClick={toggleNav}>
				<img src={toggleIcon} />
			</div>
			<div className="lhm-logo-container">
				<div className="lhm-logo-name">
					LHM
					<div className="lhm-version">{version}</div>
				</div>
			</div>
			<div className="navbar-links-container">
				<NavItem className="hover-pointer" onClick={toggleHandler('huds')}>
					<NavLink active={activeTab === 'huds'}>
						<Tabs.HUDs />
						<div>{t('navbar.huds')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer `} onClick={toggleHandler('teams')}>
					<NavLink active={activeTab === 'teams'}>
						<Tabs.Teams />
						<div>{t('common.teams')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer `} onClick={toggleHandler('players')}>
					<NavLink active={activeTab === 'players'}>
						<Tabs.Players />
						<div>{t('common.players')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer `} onClick={toggleHandler('matches')}>
					<NavLink active={activeTab === 'matches'}>
						<Tabs.Matches />
						<div>{t('match.matches')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer `} onClick={toggleHandler('tournaments')}>
					<NavLink active={activeTab === 'tournaments'}>
						<Tabs.Tournaments />
						<div>{t('common.tournaments')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer `} onClick={toggleHandler('cgpanel')}>
					<NavLink active={activeTab === 'cgpanel'}>
						<Tabs.CGMode />
						<div>{t('common.cgMode')}</div>
					</NavLink>
				</NavItem>
				<div className="separator" />
				<GameOnly game="csgo">
					<NavItem className="hover-pointer" onClick={toggleHandler('aco')}>
						<NavLink active={activeTab === 'aco'}>
							<Tabs.ACO />
							<div>{t('navbar.aco')}</div>
						</NavLink>
					</NavItem>
					<NavItem className="hover-pointer" onClick={toggleHandler('arg')}>
						<NavLink active={activeTab === 'arg'}>
							<Tabs.ARG />
							<div>ARG</div>
						</NavLink>
					</NavItem>
					<NavItem className="hover-pointer" onClick={toggleHandler('ar')}>
						<NavLink active={activeTab === 'ar'}>
							<Tabs.AR />
							<div>{t('navbar.ar')}</div>
						</NavLink>
					</NavItem>
					<NavItem className="hover-pointer" onClick={toggleHandler('live')}>
						<NavLink active={activeTab === 'live'}>
							<Tabs.Live />
							<div>{t('navbar.live')}</div>
						</NavLink>
					</NavItem>
					<NavItem className="hover-pointer" onClick={toggleHandler('cameras')}>
						<NavLink active={activeTab === 'cameras'}>
							<Tabs.Cameras />
							<div>Cameras</div>
						</NavLink>
					</NavItem>
				</GameOnly>
				<NavItem className="hover-pointer" id="settings" onClick={toggleHandler('settings')}>
					<NavLink active={activeTab === 'settings'}>
						<Tabs.Settings />
						<div>
							{t('settings.header')} {!files ? <>(!)</> : null}
						</div>
					</NavLink>
				</NavItem>
			</div>
		</Nav>
	);
};
export default Navbar;
