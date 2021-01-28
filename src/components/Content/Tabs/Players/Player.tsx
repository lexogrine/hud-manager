import React from 'react';
import { Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import { countries } from './../../../../api/countries';
import config from './../../../../api/config';

interface Props {
	player: I.Player;
	team?: I.Team;
	edit: () => void;
	hash: string;
}

const PlayerListEntry = ({ player, team, edit, hash }: Props) => {
	const country = !player.country ? null : countries[player.country] || null;
	return (
		<div className="player-list-entry">
			<div className="picture">{player.avatar ? <img src={`${player.avatar}?hash=${hash}`} /> : null}</div>
			<div className="realName">
				{player.firstName} {player.lastName}
			</div>
			<div className="username">{player.username}</div>
			<div className="team">
				{team?._id && team?.logo ? <img src={`${team.logo}?hash=${hash}`} /> : null}
				{team?.name || '-'}
			</div>
			<div className="country">
				{country ? (
					<img
						src={`${config.isDev ? config.apiAddress : '/'}files/img/flags/${country.replace(
							/ /g,
							'-'
						)}.png`}
					/>
				) : null}
			</div>
			<div className="options">
				<Button className="purple-btn round-btn" onClick={edit}>
					Edit
				</Button>
			</div>
		</div>
	);
};

export default PlayerListEntry;
