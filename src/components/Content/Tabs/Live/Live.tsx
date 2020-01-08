import React, { Component } from 'react';
import api from './../../../../api/api';
import config from './../../../../api/config';
import { Col, Row } from 'reactstrap';
import CSGOGSI, { CSGO, Player, Team } from 'csgogsi-socket';

export const { GSI, socket } = CSGOGSI(`${config.isDev ? config.apiAddress : '/'}`, 'update')

class Teamboard extends Component<{ players: Player[], steamids: string[], team: Team, toggle: Function }> {
    render() {
        const { steamids, toggle } = this.props;
        return (
            <Col s={12} md={6}>
                <div className={`scoreboard_container ${this.props.team.orientation}`}>
                    {this.props.players.map(player =>
                        <div className="scoreboard_player" key={player.steamid} onClick={() => toggle('players', { steamid: player.steamid })}>
                            <div className="name">{player.name} <i className="material-icons">{steamids.includes(player.steamid) ? 'check_circle_outline' : 'edit'}</i></div>
                            <div className="steamid">{player.steamid}</div>
                        </div>)}
                </div>
            </Col>)
    }
}

export default class Match extends Component<any, { game: CSGO | null, steamids: string[] }> {
    constructor(props: any) {
        super(props);
        this.state = {
            game: null,
            steamids: []
        }
    }
    async componentDidMount() {
        GSI.on('data', game => {
            this.setState({ game });
        });
        const players = await api.players.get();

        GSI.loadPlayers(players.map(player => (
            {
                id: player._id,
                steamid: player.steamid,
                name: player.username,
                country: player.country,
                realName: player.firstName,
                avatar: player.avatar
            }
        )));

        this.setState({ steamids: players.map(player => player.steamid) });
    }
    render() {
        const { game } = this.state;
        if (!game) return '';
        const teams = [game.map.team_ct, game.map.team_t]
        const left = teams.filter(team => team.orientation === "left")[0];
        const right = teams.filter(team => team.orientation === "right")[0];
        return (
            <React.Fragment>
                <div className="tab-title-container">Create New Team</div>
                <div className="tab-content-container">
                    <Row>
                        <Col md="12" className="config-container no-margin" style={{ flexDirection: 'column' }}>
                            <div>Players Currently In Match, Click to Add Player to Players List</div>
                        </Col>
                    </Row>
                    <Row>
                        <Teamboard players={game.players.filter(player => player.team.orientation === "left")} team={left} steamids={this.state.steamids} toggle={this.props.toggle} />
                        <Teamboard players={game.players.filter(player => player.team.orientation === "right")} team={right} steamids={this.state.steamids} toggle={this.props.toggle} />

                    </Row>
                </div>
            </React.Fragment>
        )

    }
}
