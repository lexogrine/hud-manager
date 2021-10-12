import { useTranslation } from 'react-i18next';
import { Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';
import { VetoSides } from '../../../../../types/interfaces';
import LabeledInput from '../../../LabeledInput';
import * as I from './../../../../api/interfaces';

interface Props {
	map: number;
	veto: I.Veto;
	teams: I.Team[];
	isOpen: boolean;
	toggle: () => void;
	onChange: (name: string, map: number, value: any) => void;
	maps: string[];
}

const VetoModal = ({ onChange, map, isOpen, toggle, veto, teams, maps }: Props) => {
	const changeTypeHandler = (type: I.VetoType) => () => {
		onChange('type', map, type);
	};

	const { t } = useTranslation();

	return (
		<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>Edit Veto {map + 1}</ModalHeader>
			{'type' in veto ? (
				<div className="veto_type">
					<div
						className={`type pick ${veto.type === 'pick' ? 'active' : ''}`}
						onClick={changeTypeHandler('pick')}
					>
						{t('match.vetoType.pick').toUpperCase()}
					</div>
					<div
						className={`type ban ${veto.type === 'ban' ? 'active' : ''}`}
						onClick={changeTypeHandler('ban')}
					>
						{t('match.vetoType.ban').toUpperCase()}
					</div>
					<div
						className={`type decider ${veto.type === 'decider' ? 'active' : ''}`}
						onClick={changeTypeHandler('decider')}
					>
						{t('match.vetoType.decider').toUpperCase()}
					</div>
				</div>
			) : null}
			<ModalBody>
				{'type' in veto && veto.type !== 'decider' ? (
					<>
						<FormGroup className="input-container">
							<div className="input-label-container">Choose team</div>
							{teams.map(team => (
								<div key={team._id} className="checkbox-container">
									<div
										className={`checkbox-el ${team._id === veto.teamId ? 'active' : ''}`}
										onClick={() => onChange('teamId', map, team._id)}
									>
										{team._id === veto.teamId ? `✓` : null}
									</div>
									<div className="checkbox-label">{team.name}</div>
								</div>
							))}
						</FormGroup>
						<FormGroup className="input-container side-pick-container">
							<div className="input-label-container">Does the opponent pick a side?</div>
							<div className="checkboxes">
								{(['CT', 'T', 'NO'] as VetoSides[]).map(side => (
									<div key={side} className="checkbox-container">
										<div
											className={`checkbox-el ${side === veto.side ? 'active' : ''}`}
											onClick={() => onChange('side', map, side)}
										>
											{side === veto.side ? `✓` : null}
										</div>
										<div className="checkbox-label">{side}</div>
									</div>
								))}
							</div>
						</FormGroup>
					</>
				) : null}
				{'mapName' in veto ? (
					<FormGroup>
						<LabeledInput
							type="select"
							label="Map"
							name="type"
							id="type"
							value={veto.mapName}
							onChange={e => onChange('mapName', map, e.target.value)}
						>
							<option value="" disabled defaultChecked>
								{t('common.map')}
							</option>
							{maps.map(map => (
								<option value={map} key={map}>
									{map.replace('de_', '')[0].toUpperCase()}
									{map.replace('de_', '').substr(1)}
								</option>
							))}
						</LabeledInput>
					</FormGroup>
				) : null}
				<FormGroup check>
					<Label check>
						<Input
							type="checkbox"
							onChange={e => onChange('reverseSide', map, e.target.checked)}
							checked={veto.reverseSide || false}
						/>{' '}
						<div className="customCheckbox"></div>
						{t('match.reversedSides')}
					</Label>
				</FormGroup>
			</ModalBody>
		</Modal>
	);
};

export default VetoModal;
