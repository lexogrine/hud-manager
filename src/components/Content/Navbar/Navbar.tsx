import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import * as Tabs from './TabIcons';
import { GameOnly } from '../Tabs/Config/Config';
import Tip from '../../Tooltip';
import { ContextData } from '../../Context';
import { useTranslation } from 'react-i18next';

interface IProps {
	activeTab: string;
	toggle: (tab: string, data?: any) => void;
	files: boolean;
}

const Navbar = ({ activeTab, toggle, files }: IProps) => {
	const { t } = useTranslation();
	return (
		<Nav tabs className="navbar-container">
			<NavItem className="hover-pointer">
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
			<NavItem className="hover-pointer">
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
			<NavItem className="hover-pointer">
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
			<NavItem className="hover-pointer">
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
			<GameOnly game="csgo">
				<ContextData.Consumer>
					{data =>
						!data?.customer?.license?.type ||
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
						)
					}
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
					{t('settings.header')} {!files ? <i className="material-icons">warning</i> : null}
				</NavLink>
			</NavItem>
		</Nav>
	);
};
export default Navbar;
