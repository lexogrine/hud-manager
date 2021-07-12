import React, { useState, useEffect } from 'react';
import Section from '../Section';
import { Row, Col, FormGroup, Input } from 'reactstrap';
import { IContextData } from '../../../../Context';
import { useTranslation } from 'react-i18next';
import api from '../../../../../api/api';
import * as I from './../../../../../api/interfaces';
import moment from 'moment';
import { Orientation } from 'csgogsi-socket';

interface Props {
	cxt: IContextData;
}

const TeamPreview = ({ name, logo }: { name: string; logo?: string }) => (
	<div className="team-preview">
		<div className="team-preview-logo">{logo ? <img src={logo} /> : null}</div>
		<div className="team-preview-name">{name}</div>
	</div>
);

const MatchPreview = ({ match, cxt }: { match: I.Match; cxt: IContextData }) => {
	const teams: I.Team[] = [];

	if (match) {
		//for (const veto of match.vetos) {
		//const index = match.vetos.indexOf(veto);

		/*if (!veto.mapName) {
				match.vetos[index] = {
					teamId: '',
					mapName: '',
					side: 'NO',
					mapEnd: false,
					type: 'pick'
				};
			}*/
		//}

		if (match.left.id) {
			const leftTeam = cxt.teams.find(team => team._id === match.left.id);
			if (leftTeam) teams.push(leftTeam);
		}

		if (match.right.id) {
			const rightTeam = cxt.teams.find(team => team._id === match.right.id);
			if (rightTeam) teams.push(rightTeam);
		}
	}
};

const Matches = ({ cxt }: Props) => {
	const { t } = useTranslation();

	return (
		<Section title="Matches" cxt={cxt} width={450}>
			{cxt.matches.map(match => (
				<div className="match-preview">
					<TeamPreview name={} />
				</div>
			))}
		</Section>
	);
};

export default Matches;
