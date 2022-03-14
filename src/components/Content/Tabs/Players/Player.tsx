import * as I from './../../../../api/interfaces';
import config from './../../../../api/config';
import CustomFieldValue from '../../../CustomFields/CustomFieldValue';
import { IContextData } from '../../../Context';
import { ReactComponent as EditIcon } from './../../../../styles/icons/pencil.svg';
import Checkbox from '../../../Checkbox';

interface Props {
	player: I.Player;
	team?: I.Team;
	edit: () => void;
	hash: string;
	fields: I.CustomFieldEntry[];
	togglePlayer: (id: string) => void;
	isChecked: boolean;
	cxt: IContextData;
}

const PlayerListEntry = ({ player, team, edit, hash, cxt, fields, isChecked, togglePlayer }: Props) => {
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
				{player.country ? (
					<img
						src={`${config.isDev ? config.apiAddress : '/'}files/img/flags/ISO/${player.country}.png`}
					/>
				) : null}
			</div>
			{fields.map(field => (
				<div className="custom-field" key={field._id}>
					<CustomFieldValue cxt={cxt} field={field} value={player.extra?.[field.name]} />
				</div>
			))}
			<div className="options">
				<EditIcon className="image-button transparent" onClick={edit} style={{ marginLeft: 18 }} />
				<Checkbox
					checked={isChecked}
					onChange={() => {
						togglePlayer(player._id);
					}}
				/>
			</div>
		</div>
	);
};

export default PlayerListEntry;
