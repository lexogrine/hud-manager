import * as I from '../../api/interfaces';
import isSvg from '../../isSvg';
import { getMatchName } from '../../utils';
import { IContextData } from '../Context';

interface Props {
	field: I.CustomFieldEntry;
	value: string;
	cxt: IContextData;
}

const CustomFieldValue = ({ field, value, cxt }: Props) => {
	const getValue = () => {
		if (!value) {
			return null;
		}
		if (field.type === 'text') {
			return value;
		}
		if (field.type === 'team') {
			return cxt.teams.find(team => team._id === value)?.name || 'Unknown team';
		}
		if (field.type === 'player') {
			return cxt.players.find(player => player._id === value)?.username || 'Unknown player';
		}
		if (field.type === 'match') {
			return getMatchName(
				cxt.matches.find(match => match.id === value),
				cxt.teams
			);
		}
		if (field.type === 'color') {
			return (
				<div className="color-value">
					<div className="color-preview" style={{ backgroundColor: value }} />
					<div className="color-hex">{value}</div>
				</div>
			);
		}
		const imgSrc = value
			? `data:image/${isSvg(Buffer.from(value, 'base64')) ? 'svg+xml' : 'png'};base64,${value}`
			: value;

		return <img src={imgSrc} />;
	};
	return <div>{getValue()}</div>;
};

export default CustomFieldValue;
