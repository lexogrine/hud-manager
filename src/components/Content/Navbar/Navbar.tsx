import React from 'react';
import {Nav, NavItem, NavLink} from "reactstrap";
import * as Tabs from './TabIcons';


export default class Navbar extends React.Component<{activeTab: string, toggle: Function}, any> {
    render() {
        return (
            <Nav tabs className="navbar-container">
                <NavItem className="hover-pointer">
                    <NavLink
                        active={ this.props.activeTab === 'teams' }
                        onClick={() => { this.props.toggle('teams'); }}
                    >
                        <img src={Tabs.Teams} alt="Teams"/>
                        <div>Teams</div>
                    </NavLink>
                </NavItem>
                <NavItem className="hover-pointer">
                    <NavLink
                        active={ this.props.activeTab === 'players' }
                        onClick={() => { this.props.toggle('players'); }}
                    >
                        <img src={Tabs.Players} alt="Players"/>
                        <div>Players</div>
                    </NavLink>
                </NavItem>
                <NavItem className="hover-pointer">
                    <NavLink
                        active={ this.props.activeTab === 'create_match' }
                        onClick={() => { this.props.toggle('create_match'); }}
                    >
                        <img src={Tabs.Matches} alt="Matches"/>
                        <div>Matches</div>
                    </NavLink>
                </NavItem>
                <NavItem className="hover-pointer">
                    <NavLink
                        active={ this.props.activeTab === 'huds' }
                        onClick={() => { this.props.toggle('huds'); }}
                    >
                        <img src={Tabs.HUDs} alt="HUDs"/>
                        <div>HUDs</div>
                    </NavLink>
                </NavItem>
                <NavItem className="hover-pointer">
                    <NavLink
                        active={ this.props.activeTab === 'live' }
                        onClick={() => { this.props.toggle('live'); }}
                    >
                        <img src={Tabs.Live} alt="Live"/>
                        <div>Live</div>
                    </NavLink>
                </NavItem>
                <NavItem className="hover-pointer" id="settings">
                    <NavLink
                        active={ this.props.activeTab === 'config' }
                        onClick={() => { this.props.toggle('config'); }}
                    >Settings
                    </NavLink>
                </NavItem>
                {/*<NavItem className="hover-pointer">
                    <NavLink
                        active={ this.props.activeTab === 'config' }
                        onClick={() => { this.props.toggle('config'); }}
                    >Config
                    </NavLink>
                </NavItem>
                <NavItem className="hover-pointer">
                    <NavLink
                        active={ this.props.activeTab === 'credits' }
                        onClick={() => { this.props.toggle('credits'); }}
                    >Credits
                    </NavLink>
        </NavItem>*/}
            </Nav>
        );
    }
}
