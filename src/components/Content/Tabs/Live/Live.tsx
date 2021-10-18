import { useEffect, useState } from 'react';
import config from './../../../../api/config';
import { Col, Row, Button } from 'reactstrap';
import { GSISocket, CSGO, Player, Team, PlayerExtension } from 'csgogsi-socket';
import { IContextData } from '../../../Context';
import { useTranslation } from 'react-i18next';
import api from '../../../../api/api';
import { ReactComponent as EditIcon } from './../../../../styles/icons/pencil.svg';

export const { GSI, socket } = GSISocket(`${config.isDev ? config.apiAddress : '/'}`, 'update');

interface Props {
	players: Player[];
	team: Team;
	toggle: (tab: string, data?: any) => void;
	cxt: IContextData;
}

const mapPlayer =
	(cxt: IContextData) =>
		(player: Player): PlayerExtension => {
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
				name: data.username || player.name,
				steamid: data.steamid,
				realName: data.firstName + ' ' + data.lastName,
				country: data.country,
				avatar: data.avatar,
				extra: {}
			};
		};
const Teamboard = ({ players, team, toggle, cxt }: Props) => {
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
				{players.map(mapPlayer(cxt)).map(player => (
					<div
						className="scoreboard_player"
						key={player.steamid}
						onClick={() => toggle('players', { steamid: player.steamid })}
					>
						<div>
							<div className="name">
								{player.name}
							</div>
							<div className="steamid">{player.steamid}</div>
						</div>
						<EditIcon />
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
			<>
				<div className="tab-content-container full-scroll">{t('live.noGame')}</div>
			</>
		);
	const teams = [game.map.team_ct, game.map.team_t];
	const left = teams.find(team => team.orientation === 'left');
	const right = teams.find(team => team.orientation === 'right');

	const replace = () => {
		api.players.replaceUsernames(game.players.map(mapPlayer(cxt)));
	};

	if (!left || !right) {
		return (
			<>
				<div className="tab-content-container full-scroll">{t('live.noGame')}</div>
			</>
		);
	}

	return (
		<>
			<div className="tab-content-container full-scroll">
				<Row>
					<Col md="12" className="config-container no-margin" style={{ flexDirection: 'column', fontSize: '12px', marginBottom: '50px' }}>
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
				<Row>
					<Col md="12">
						<Button className="lightblue-btn round-btn" onClick={replace}>
							Replace usernames
						</Button>
					</Col>
				</Row>
			</div>
		</>
	);
};

export default Live;
