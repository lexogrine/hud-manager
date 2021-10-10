import { Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
//import { countries } from './../../../../api/countries';
//import config from './../../../../api/config';
//import CustomFieldValue from '../../../CustomFields/CustomFieldValue';
import { IContextData } from '../../../Context';
import { useTranslation } from 'react-i18next';

interface Props {
	team: I.Tournament;
	edit: () => void;
	hash: string;
	fields: I.CustomFieldEntry[];
	cxt: IContextData;
	show: () => void;
}

const TournamentListEntry = ({ team, show /*hash, fields, cxt*/ }: Props) => {
	const { t } = useTranslation();
	return (
		<div className="item-list-entry">
			<div className="picture"></div>
			<div className="name">{team.name}</div>
			<div className="options">
				<Button className="purple-btn round-btn" onClick={show}>
					{t('common.edit')}
				</Button>
			</div>
		</div>
	);
};

export default TournamentListEntry;
