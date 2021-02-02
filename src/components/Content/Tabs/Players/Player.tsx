import React from 'react';
import { Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import { countries } from './../../../../api/countries';
import config from './../../../../api/config';
import CustomFieldValue from '../../../CustomFields/CustomFieldValue';
import { IContextData } from '../../../Context';

interface Props {
	player: I.Player;
	team?: I.Team;
	edit: () => void;
	hash: string;
	fields: I.CustomFieldEntry[];
	cxt: IContextData;
}

const PlayerListEntry = ({ player, team, edit, hash, cxt, fields }: Props) => {
	const country = !player.country ? null : countries[player.country] || null;
	return (
		<div className="item-list-entry">
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
			{fields.map(field => (
				<div className="custom-field" key={field._id}>
					<CustomFieldValue cxt={cxt} field={field} value={player.extra?.[field.name]} />
				</div>
			))}
			<div className="options">
				<Button className="purple-btn round-btn" onClick={edit}>
					Edit
				</Button>
			</div>
		</div>
	);
};

export default PlayerListEntry;
