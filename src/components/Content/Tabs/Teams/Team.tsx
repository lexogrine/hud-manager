import * as I from './../../../../api/interfaces';
import { countries } from './../../../../api/countries';
import config from './../../../../api/config';
import CustomFieldValue from '../../../CustomFields/CustomFieldValue';
import { IContextData } from '../../../Context';
import { ReactComponent as EditIcon } from './../../../../styles/icons/pencil.svg';
import Checkbox from '../../../Checkbox';

interface Props {
	team: I.Team;
	edit: () => void;
	hash: string;
	fields: I.CustomFieldEntry[];
	toggleTeam: (id: string) => void;
	isChecked: boolean;
	cxt: IContextData;
}

const TeamListEntry = ({ team, edit, hash, fields, cxt, isChecked, toggleTeam }: Props) => {
	const country = !team.country ? null : countries[team.country] || null;
	return (
		<div className="item-list-entry">
			<div className="picture">{team.logo ? <img src={`${team.logo}?hash=${hash}`} /> : null}</div>
			<div className="name">{team.name}</div>
			<div className="shortname">{team.shortName}</div>
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
					<CustomFieldValue cxt={cxt} field={field} value={team.extra?.[field.name]} />
				</div>
			))}
			<div className="options">
				<EditIcon className="image-button transparent" onClick={edit} style={{ marginLeft: 18 }} />
				<Checkbox
					checked={isChecked}
					onChange={() => {
						toggleTeam(team._id);
					}}
				/>
			</div>
		</div>
	);
};

export default TeamListEntry;
