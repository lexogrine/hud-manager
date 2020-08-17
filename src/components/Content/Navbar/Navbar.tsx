import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import * as Tabs from './TabIcons';

interface IProps {
	activeTab: string;
	toggle: Function;
	files: boolean;
}
export default class Navbar extends React.Component<IProps> {
	render() {
		return (
			<Nav tabs className="navbar-container">
				<NavItem className="hover-pointer">
					<NavLink
						active={this.props.activeTab === 'teams'}
						onClick={() => {
							this.props.toggle('teams');
						}}
					>
						<img src={Tabs.Teams} alt="Teams" />
						<div>Teams</div>
					</NavLink>
				</NavItem>
				<NavItem className="hover-pointer">
					<NavLink
						active={this.props.activeTab === 'players'}
						onClick={() => {
							this.props.toggle('players');
						}}
					>
						<img src={Tabs.Players} alt="Players" />
						<div>Players</div>
					</NavLink>
				</NavItem>
				<NavItem className="hover-pointer">
					<NavLink
						active={this.props.activeTab === 'create_match'}
						onClick={() => {
							this.props.toggle('create_match');
						}}
					>
						<img src={Tabs.Matches} alt="Matches" />
						<div>Matches</div>
					</NavLink>
				</NavItem>
				<NavItem className="hover-pointer">
					<NavLink
						active={this.props.activeTab === 'tournaments'}
						onClick={() => {
							this.props.toggle('tournaments');
						}}
					>
						<img src={Tabs.Tournaments} alt="Tournaments" />
						<div>Tournaments</div>
					</NavLink>
				</NavItem>
				<NavItem className="hover-pointer">
					<NavLink
						active={this.props.activeTab === 'huds'}
						onClick={() => {
							this.props.toggle('huds');
						}}
					>
						<img src={Tabs.HUDs} alt="HUDs" />
						<div>HUDs</div>
					</NavLink>
				</NavItem>
				<NavItem className="hover-pointer">
					<NavLink
						active={this.props.activeTab === 'live'}
						onClick={() => {
							this.props.toggle('live');
						}}
					>
						<img src={Tabs.Live} alt="Live" />
						<div>Live</div>
					</NavLink>
				</NavItem>
				<NavItem className="hover-pointer" id="settings">
					<NavLink
						active={this.props.activeTab === 'config'}
						onClick={() => {
							this.props.toggle('config');
						}}
					>
						Settings {!this.props.files ? <i className="material-icons">warning</i> : null}
					</NavLink>
				</NavItem>
			</Nav>
		);
	}
}
