import React, { Component } from 'react';
import config from './../../../../api/config';
import { Col, Row } from 'reactstrap';
import { GSISocket, CSGO, Player, Team, PlayerExtension } from 'csgogsi-socket';
import { IContextData } from '../../../Context';

export const { GSI, socket } = GSISocket(`${config.isDev ? config.apiAddress : '/'}`, 'update');

class Teamboard extends Component<{ players: Player[]; team: Team; toggle: Function; cxt: IContextData }> {
	remapPlayer = (player: Player): PlayerExtension => {
		const { players } = this.props.cxt;
		const data = players.filter(origin => origin.steamid === player.steamid)[0];
		if (!data) {
			return {
				id: player.steamid,
				name: player.name,
				steamid: player.steamid,
				realName: null,
				country: null,
				avatar: null,
				extra: {}
			};
		}
		return {
			id: data._id,
			name: data.username,
			steamid: data.steamid,
			realName: data.firstName + ' ' + data.lastName,
			country: data.country,
			avatar: data.avatar,
			extra: {}
		};
	};

	render() {
		const { cxt, toggle, team } = this.props;
		return (
			<Col s={12} md={6}>
				<Row className={`scoreboard_score ${this.props.team.orientation} no-margin-row ${team.side}`}>
					<Col s={12} md={10} className="team_name">
						{team.name}
					</Col>
					<Col s={12} md={2} className="score">
						{team.score}
					</Col>
				</Row>
				<div className={`scoreboard_container ${this.props.team.orientation}`}>
					{this.props.players.map(this.remapPlayer).map(player => (
						<div
							className="scoreboard_player"
							key={player.steamid}
							onClick={() => toggle('players', { steamid: player.steamid })}
						>
							<div className="name">
								{player.name}{' '}
								<i className="material-icons">
									{cxt.players.map(player => player.steamid).includes(player.steamid)
										? 'check_circle_outline'
										: 'edit'}
								</i>
							</div>
							<div className="steamid">{player.steamid}</div>
						</div>
					))}
				</div>
			</Col>
		);
	}
}

export default class Live extends Component<{ toggle: Function; cxt: IContextData }, { game: CSGO | null }> {
	constructor(props: any) {
		super(props);
		this.state = {
			game: null
		};
	}
	async componentDidMount() {
		GSI.on('data', game => {
			this.setState({ game });
		});
	}
	render() {
		const { game } = this.state;
		if (!game)
			return (
				<React.Fragment>
					<div className="tab-title-container">Live</div>
					<div className="tab-content-container full-scroll">No game is currently live.</div>
				</React.Fragment>
			);
		const teams = [game.map.team_ct, game.map.team_t];
		const left = teams.filter(team => team.orientation === 'left')[0];
		const right = teams.filter(team => team.orientation === 'right')[0];
		return (
			<React.Fragment>
				<div className="tab-title-container">Live</div>
				<div className="tab-content-container full-scroll">
					<Row>
						<Col md="12" className="config-container no-margin" style={{ flexDirection: 'column' }}>
							<div>Players currently in match, click to add a player to the player list.</div>
						</Col>
					</Row>
					<Row>
						<Teamboard
							players={game.players.filter(player => player.team.orientation === 'left')}
							cxt={this.props.cxt}
							team={left}
							toggle={this.props.toggle}
						/>
						<Teamboard
							players={game.players.filter(player => player.team.orientation === 'right')}
							cxt={this.props.cxt}
							team={right}
							toggle={this.props.toggle}
						/>
					</Row>
				</div>
			</React.Fragment>
		);
	}
}
