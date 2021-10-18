import * as I from './../../../../api/interfaces';
//import { countries } from './../../../../api/countries';
//import config from './../../../../api/config';
//import CustomFieldValue from '../../../CustomFields/CustomFieldValue';
import { IContextData } from '../../../Context';
import { hash } from '../../../../hash';
import isSvg from '../../../../isSvg';

interface Props {
	tournament: I.Tournament;
	edit: () => void;
	hash: string;
	fields: I.CustomFieldEntry[];
	cxt: IContextData;
	index: number;
	show: () => void;
}

const TournamentListEntry = ({ tournament, show, index /*hash, fields, cxt*/ }: Props) => {

	let logo = '';
	if (tournament.logo) {
		if (tournament.logo.includes('api/players/avatar')) {
			logo = `${tournament.logo}?hash=${hash()}`;
		} else {
			logo = `data:image/${isSvg(Buffer.from(tournament.logo, 'base64')) ? 'svg+xml' : 'png'};base64,${
				tournament.logo
			}`;
		}
	}
	let tournamentTeams = `${tournament.playoffs.teams} Teams`;

	if (tournament.groups.length) {
		const amountOfTeamsInGroups = tournament.groups.map(group => group.teams).reduce((a, b) => a + b, 0);
		tournamentTeams = `${amountOfTeamsInGroups}/${tournamentTeams}`;
	}
	return (
		<div className="tournament-entry" onClick={show}>
			<div className={`logo-container bg-${index%8}`}>
				<div className="overlay">
					<img src={logo} />
				</div>
			</div>
			<div className="tournament-separator"></div>
			<div className="tournament-info">
				<div className="tournament-name">
					{tournament.name}
				</div>
				<div className="tournament-groups">
					{tournamentTeams}
				</div>
			</div>
		</div>
	);
};

export default TournamentListEntry;
