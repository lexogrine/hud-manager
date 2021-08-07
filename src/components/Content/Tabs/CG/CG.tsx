
import { IContextData } from '../../../Context';
import PlayerForm from './Player';
import TeamForm from './Team';
import CurrentMatchForm from './Match';
import Matches from './Matches';

const CG = ({ cxt }: { cxt: IContextData }) => {
	return (
		<div className="cg-panel tab-content-container full-scroll">
			<Matches cxt={cxt} />
			<PlayerForm cxt={cxt} />
			<TeamForm cxt={cxt} />
			<CurrentMatchForm cxt={cxt} />
		</div>
	);
};

export default CG;
