import React from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import * as Tabs from "./TabIcons";

export enum NavbarTabs {
  Teams = "teams",
  Players = "players",
  CreateMatch = "create_match",
  Huds = "huds",
  Live = "live",
  Settings = "settings",
  Config = "config",
  Credits = "credits",
}

interface IProps {
  activeTab: NavbarTabs;
  toggle: Function;
  files: boolean;
}
export default class Navbar extends React.Component<IProps> {
  render() {
    return (
      <Nav tabs className="navbar-container">
        <NavItem className="hover-pointer">
          <NavLink
            active={this.props.activeTab === NavbarTabs.Teams}
            onClick={() => {
              this.props.toggle("teams");
            }}
          >
            <img src={Tabs.Teams} alt="Teams" />
            <div>Teams</div>
          </NavLink>
        </NavItem>
        <NavItem className="hover-pointer">
          <NavLink
            active={this.props.activeTab === NavbarTabs.Players}
            onClick={() => {
              this.props.toggle("players");
            }}
          >
            <img src={Tabs.Players} alt="Players" />
            <div>Players</div>
          </NavLink>
        </NavItem>
        <NavItem className="hover-pointer">
          <NavLink
            active={this.props.activeTab === NavbarTabs.CreateMatch}
            onClick={() => {
              this.props.toggle("create_match");
            }}
          >
            <img src={Tabs.Matches} alt="Matches" />
            <div>Matches</div>
          </NavLink>
        </NavItem>
        <NavItem className="hover-pointer">
          <NavLink
            active={this.props.activeTab === NavbarTabs.Huds}
            onClick={() => {
              this.props.toggle("huds");
            }}
          >
            <img src={Tabs.HUDs} alt="HUDs" />
            <div>HUDs</div>
          </NavLink>
        </NavItem>
        <NavItem className="hover-pointer">
          <NavLink
            active={this.props.activeTab === NavbarTabs.Live}
            onClick={() => {
              this.props.toggle("live");
            }}
          >
            <img src={Tabs.Live} alt="Live" />
            <div>Live</div>
          </NavLink>
        </NavItem>
        <NavItem className="hover-pointer" id="settings">
          <NavLink
            active={this.props.activeTab === NavbarTabs.Config}
            onClick={() => {
              this.props.toggle("config");
            }}
          >
            Settings{" "}
            {!this.props.files ? (
              <i className="material-icons">warning</i>
            ) : null}
          </NavLink>
        </NavItem>
        {/*<NavItem className="hover-pointer">
                    <NavLink
                        active={ this.props.activeTab === NavbarTabs.Config }
                        onClick={() => { this.props.toggle('config'); }}
                    >Config
                    </NavLink>
                </NavItem>
                <NavItem className="hover-pointer">
                    <NavLink
                        active={ this.props.activeTab === NavbarTabs.Credits }
                        onClick={() => { this.props.toggle('credits'); }}
                    >Credits
                    </NavLink>
        </NavItem>*/}
      </Nav>
    );
  }
}
