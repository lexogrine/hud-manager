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
}

const Navbar = ({ activeTab, toggle, files }: IProps) => {
	const [config, setConfig] = useState<Config | null>(null);
	const [isCollapsed, setCollapse] = useState(false);
	const { t } = useTranslation();

	const getConfig = async () => {
		const config = await api.config.get();

		const { ip, ...cfg } = config;

		setConfig(cfg);
	};
	const toggleNav = () => {
		setCollapse(!isCollapsed);
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
				<NavItem className="hover-pointer">
					<NavLink
						active={activeTab === 'huds'}
						onClick={() => {
							toggle('huds');
						}}
					>
						<img src={Tabs.HUDs} alt="HUDs" />
						<div>{t('navbar.huds')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer ${config && config.cg ? '' : 'hide'}`}>
					<NavLink
						active={activeTab === 'cgpanel'}
						onClick={() => {
							toggle('cgpanel');
						}}
					>
						<img src={Tabs.Teams} alt="Panel" />
						<div>{t('common.panel')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer ${onlyNonCGClass}`}>
					<NavLink
						active={activeTab === 'teams'}
						onClick={() => {
							toggle('teams');
						}}
					>
						<img src={Tabs.Teams} alt="Teams" />
						<div>{t('common.teams')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer ${onlyNonCGClass}`}>
					<NavLink
						active={activeTab === 'players'}
						onClick={() => {
							toggle('players');
						}}
					>
						<img src={Tabs.Players} alt="Players" />
						<div>{t('common.players')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer ${onlyNonCGClass}`}>
					<NavLink
						active={activeTab === 'create_match'}
						onClick={() => {
							toggle('create_match');
						}}
					>
						<img src={Tabs.Matches} alt="Matches" />
						<div>{t('match.matches')}</div>
					</NavLink>
				</NavItem>
				<NavItem className={`hover-pointer ${onlyNonCGClass}`}>
					<NavLink
						active={activeTab === 'tournaments'}
						onClick={() => {
							toggle('tournaments');
						}}
					>
						<img src={Tabs.Tournaments} alt="Tournaments" />
						<div>{t('common.tournaments')}</div>
					</NavLink>
				</NavItem>
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
												<NavLink
													active={activeTab === 'aco'}
													disabled
													onClick={() => {
														toggle('aco');
													}}
												>
													<img src={Tabs.ACO} alt="ACO" />
													<div>{t('navbar.aco')}</div>
												</NavLink>
											</NavItem>
										}
									>
										{t('navbar.professionalOnly')}
									</Tip>
								) : (
									<NavItem className="hover-pointer">
										<NavLink
											active={activeTab === 'aco'}
											onClick={() => {
												toggle('aco');
											}}
										>
											<img src={Tabs.ACO} alt="ACO" />
											<div>{t('navbar.aco')}</div>
										</NavLink>
									</NavItem>
								)}
								{!data?.customer?.license?.type || data.customer?.license.type === 'free' ? (
									<Tip
										id="arg_nav"
										label={
											<NavItem className="hover-pointer">
												<NavLink
													active={activeTab === 'arg'}
													disabled
													onClick={() => {
														toggle('arg');
													}}
												>
													<img src={Tabs.ARG} alt="ARG" />
													<div>ARG</div>
												</NavLink>
											</NavItem>
										}
									>
										{t('navbar.nonFreeOnly')}
									</Tip>
								) : (
									<NavItem className="hover-pointer">
										<NavLink
											active={activeTab === 'arg'}
											onClick={() => {
												toggle('arg');
											}}
										>
											<img src={Tabs.ARG} alt="ARG" />
											<div>ARG</div>
										</NavLink>
									</NavItem>
								)}
							</>
						)}
					</ContextData.Consumer>
					<NavItem className="hover-pointer">
						<NavLink
							active={activeTab === 'ar'}
							onClick={() => {
								toggle('ar');
							}}
						>
							<img src={Tabs.AR} alt="AR" />
							<div>{t('navbar.ar')}</div>
						</NavLink>
					</NavItem>
					<NavItem className="hover-pointer">
						<NavLink
							active={activeTab === 'live'}
							onClick={() => {
								toggle('live');
							}}
						>
							<img src={Tabs.Live} alt="Live" />
							<div>{t('navbar.live')}</div>
						</NavLink>
					</NavItem>
				</GameOnly>
				<NavItem className="hover-pointer" id="settings">
					<NavLink
						active={activeTab === 'config'}
						onClick={() => {
							toggle('config');
						}}
					>
						<img src={Tabs.Settings} alt="Settings" />
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
