import React from 'react';
import { IContextData } from '../../../Context';
import PlayerForm from './Player';
import TeamForm from './Team';
import CurrentMatchForm from './Match';

const CG = ({ cxt }: { cxt: IContextData }) => {
	return (
		<div className="cg-panel tab-content-container full-scroll">
			<CurrentMatchForm cxt={cxt} />
			<PlayerForm cxt={cxt} />
			<TeamForm cxt={cxt} />
		</div>
	);
};

export default CG;
