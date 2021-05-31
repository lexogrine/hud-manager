import React, { useEffect, useState } from 'react';
import config from './../../../../api/config';
import { Col, Row } from 'reactstrap';
import { GSISocket, CSGO, Player, Team, PlayerExtension } from 'csgogsi-socket';
import { IContextData } from '../../../Context';
import { useTranslation } from 'react-i18next';

export const { GSI, socket } = GSISocket(`${config.isDev ? config.apiAddress : '/'}`, 'update');

interface Props {
	players: Player[];
	team: Team;
	toggle: (tab: string, data?: any) => void;
	cxt: IContextData;
}

const Teamboard = ({ players, team, toggle, cxt }: Props) => {
	const mapPlayer = (player: Player): PlayerExtension => {
		const { players } = cxt;
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

	return (
		<Col s={12} md={6}>
			<Row className={`scoreboard_score ${team.orientation} no-margin-row ${team.side}`}>
				<Col s={12} md={10} className="team_name">
					{team.name}
				</Col>
				<Col s={12} md={2} className="score">
					{team.score}
				</Col>
			</Row>
			<div className={`scoreboard_container ${team.orientation}`}>
				{players.map(mapPlayer).map(player => (
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
};

const Live = ({ toggle, cxt }: { toggle: (tab: string, data?: any) => void; cxt: IContextData }) => {
	const [game, setGame] = useState<CSGO | null>(null);

	const { t } = useTranslation();

	useEffect(() => {
		GSI.on('data', setGame);
	}, []);

	if (!game)
		return (
			<React.Fragment>
				<div className="tab-title-container">{t('live.header')}</div>
				<div className="tab-content-container full-scroll">{t('live.noGame')}</div>
			</React.Fragment>
		);
	const teams = [game.map.team_ct, game.map.team_t];
	const left = teams.find(team => team.orientation === 'left');
	const right = teams.find(team => team.orientation === 'right');

	if (!left || !right) {
		return (
			<React.Fragment>
				<div className="tab-title-container">{t('live.header')}</div>
				<div className="tab-content-container full-scroll">{t('live.noGame')}</div>
			</React.Fragment>
		);
	}

	return (
		<React.Fragment>
			<div className="tab-title-container">{t('live.header')}</div>
			<div className="tab-content-container full-scroll">
				<Row>
					<Col md="12" className="config-container no-margin" style={{ flexDirection: 'column' }}>
						<div>{t('live.tip')}</div>
					</Col>
				</Row>
				<Row>
					<Teamboard
						players={game.players.filter(player => player.team.orientation === 'left')}
						cxt={cxt}
						team={left}
						toggle={toggle}
					/>
					<Teamboard
						players={game.players.filter(player => player.team.orientation === 'right')}
						cxt={cxt}
						team={right}
						toggle={toggle}
					/>
				</Row>
			</div>
		</React.Fragment>
	);
};

export default Live;
