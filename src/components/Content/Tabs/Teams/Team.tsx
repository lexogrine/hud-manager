import * as I from './../../../../api/interfaces';
import { countries } from './../../../../api/countries';
import config from './../../../../api/config';
import CustomFieldValue from '../../../CustomFields/CustomFieldValue';
import { IContextData } from '../../../Context';
import editIcon from './../../../../styles/edit.png';

interface Props {
	team: I.Team;
	edit: () => void;
	hash: string;
	fields: I.CustomFieldEntry[];
	cxt: IContextData;
}

const TeamListEntry = ({ team, edit, hash, fields, cxt }: Props) => {
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
				<img src={editIcon} className="image-button" onClick={edit} />
			</div>
		</div>
	);
};

export default TeamListEntry;
