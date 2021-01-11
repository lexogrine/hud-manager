import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import { countries } from './../../../../api/countries';
import config from './../../../../api/config';

interface Props {
	player: I.Player;
	team?: I.Team;
	edit: () => void;
	no: number;
}

const PlayerListEntry = ({ player, team, edit, no }: Props) => {
	const country = !player.country ? null : countries[player.country] || null;
	return (
		<div className="player-list-entry" onClick={edit}>
			<div className="position">{no + 1}</div>
			<div className="picture">{player.avatar ? <img src={player.avatar} /> : null}</div>
			<div className="realName">
				{player.firstName} {player.lastName}
			</div>
			<div className="username">{player.username}</div>
			<div className="team">
				{team?._id && team?.logo ? <img src={team.logo} /> : null}
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
		</div>
	);
};

export default PlayerListEntry;
