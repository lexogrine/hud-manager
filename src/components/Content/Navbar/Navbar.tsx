import { useEffect, useState } from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import * as Tabs from './TabIcons';
import { GameOnly } from '../Tabs/Config/Config';
import Tip from '../../Tooltip';
import { ContextData } from '../../Context';
import { useTranslation } from 'react-i18next';
//import { isCGMode } from '../Content';
import { socket } from '../Tabs/Live/Live';
import { Config } from '../../../api/interfaces';
import api from '../../../api/api';
import toggleIcon from './../../../styles/navbarToggle.png';
interface IProps {
	activeTab: string;
	toggle: (tab: string, data?: any) => void;
	files: boolean;
	isCollapsed: boolean;
	setCollapse: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar = ({ activeTab, toggle, files, setCollapse, isCollapsed }: IProps) => {
	const [config, setConfig] = useState<Config | null>(null);
	const { t } = useTranslation();

	const getConfig = async () => {
		const config = await api.config.get();

		const { ip, ...cfg } = config;

		setConfig(cfg);
	};
	const toggleNav = () => {
		setCollapse(!isCollapsed);
	};

	const toggleHandler = (tab: string) => () => {
		toggle(tab);
	};

	useEffect(() => {
		socket.on('config', getConfig);
		getConfig();
	}, []);

	const onlyNonCGClass = !config || !config.cg ? '' : 'hide';
	return (
		<Nav tabs className={`navbar-container ${isCollapsed ? 'collapsed' : ''}`}>
			<div className="collapse-button" onClick={toggleNav}>
				<img src={toggleIcon} />
			</div>
			<div className="lhm-logo-container">
				<div className="lhm-logo-name">
					LHM
					<div className="lhm-version">3.0.0</div>
				</div>
			</div>
			<div className="navbar-links-container">
				<NavItem className="hover-pointer" onClick={toggleHandler('huds')}>
					<NavLink active={activeTab === 'huds'}>
						<Tabs.HUDs />
						<div>{t('navbar.huds')}</div>
					</NavLink>
				</NavItem>
				<NavItem
					className={`hover-pointer ${config && config.cg ? '' : 'hide'}`}
					onClick={toggleHandler('cgpanel')}
				>
					<NavLink active={activeTab === 'cgpanel'}>
						<Tabs.Teams />
						<div>{t('common.panel')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer ${onlyNonCGClass}`} onClick={toggleHandler('teams')}>
					<NavLink active={activeTab === 'teams'}>
						<Tabs.Teams />
						<div>{t('common.teams')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer ${onlyNonCGClass}`} onClick={toggleHandler('players')}>
					<NavLink active={activeTab === 'players'}>
						<Tabs.Players />
						<div>{t('common.players')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer ${onlyNonCGClass}`} onClick={toggleHandler('create_match')}>
					<NavLink active={activeTab === 'create_match'}>
						<Tabs.Matches />
						<div>{t('match.matches')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer ${onlyNonCGClass}`} onClick={toggleHandler('tournaments')}>
					<NavLink active={activeTab === 'tournaments'}>
						<Tabs.Tournaments />
						<div>{t('common.tournaments')}</div>
					</NavLink>
				</NavItem>
				<div className="separator" />
				<GameOnly game="csgo">
					<ContextData.Consumer>
						{data => (
							<>
								{!data?.customer?.license?.type ||
								data.customer?.license.type === 'free' ||
								data.customer.license.type === 'personal' ? (
									<Tip
										id="aco_nav"
										label={
											<NavItem className="hover-pointer">
												<NavLink active={activeTab === 'aco'} disabled>
													<Tabs.ACO />
													<div>{t('navbar.aco')}</div>
												</NavLink>
											</NavItem>
										}
									>
										{t('navbar.professionalOnly')}
									</Tip>
								) : (
									<NavItem className="hover-pointer" onClick={toggleHandler('aco')}>
										<NavLink active={activeTab === 'aco'}>
											<Tabs.ACO />
											<div>{t('navbar.aco')}</div>
										</NavLink>
									</NavItem>
								)}
								{!data?.customer?.license?.type || data.customer?.license.type === 'free' ? (
									<Tip
										id="arg_nav"
										label={
											<NavItem className="hover-pointer">
												<NavLink active={activeTab === 'arg'} disabled>
													<Tabs.ARG />
													<div>ARG</div>
												</NavLink>
											</NavItem>
										}
									>
										{t('navbar.nonFreeOnly')}
									</Tip>
								) : (
									<NavItem className="hover-pointer" onClick={toggleHandler('arg')}>
										<NavLink active={activeTab === 'arg'}>
											<Tabs.ARG />
											<div>ARG</div>
										</NavLink>
									</NavItem>
								)}
							</>
						)}
					</ContextData.Consumer>
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
				<NavItem className="hover-pointer" id="settings" onClick={toggleHandler('config')}>
					<NavLink active={activeTab === 'config'}>
						<Tabs.Settings />
						<div>
							{t('settings.header')} {!files ? <i className="material-icons">warning</i> : null}
						</div>
					</NavLink>
				</NavItem>
			</div>
		</Nav>
	);
};
export default Navbar;
