import React from 'react';
import { Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';
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
	return (
		<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>Edit Veto {map + 1}</ModalHeader>
			<div className="veto_type">
				<div
					className={`type pick ${veto.type === 'pick' ? 'active' : ''}`}
					onClick={changeTypeHandler('pick')}
				>
					PICK
				</div>
				<div
					className={`type ban ${veto.type === 'ban' ? 'active' : ''}`}
					onClick={changeTypeHandler('ban')}
				>
					BAN
				</div>
				<div
					className={`type decider ${veto.type === 'decider' ? 'active' : ''}`}
					onClick={changeTypeHandler('decider')}
				>
					DECIDER
				</div>
			</div>
			<ModalBody>
				{veto.type !== 'decider' ? (
					<>
						<FormGroup>
							<Input
								type="select"
								name="teams"
								id="teams"
								value={veto.teamId}
								onChange={e => onChange('teamId', map, e.target.value)}
							>
								<option value="">No team</option>
								{teams.map(teams => (
									<option key={teams._id} value={teams._id}>
										{teams.name}
									</option>
								))}
							</Input>
						</FormGroup>
						<FormGroup>
							<Input
								type="select"
								name="side"
								id="side"
								value={veto.side}
								onChange={e => onChange('side', map, e.target.value)}
							>
								<option value={'NO'} disabled defaultChecked>
									Does the opponent pick a side?
								</option>
								<option value={'NO'}>No</option>
								<option value={'CT'}>CT</option>
								<option value={'T'}>T</option>
							</Input>
						</FormGroup>
					</>
				) : null}
				<FormGroup>
					<Input
						type="select"
						name="type"
						id="type"
						value={veto.mapName}
						onChange={e => onChange('mapName', map, e.target.value)}
					>
						<option value="" disabled defaultChecked>
							Map
						</option>
						{maps.map(map => (
							<option value={map} key={map}>
								{map.replace('de_', '')[0].toUpperCase()}
								{map.replace('de_', '').substr(1)}
							</option>
						))}
					</Input>
				</FormGroup>
				<FormGroup check>
					<Label check>
						<Input
							type="checkbox"
							onChange={e => onChange('reverseSide', map, e.target.checked)}
							checked={veto.reverseSide || false}
						/>{' '}
						<div className="customCheckbox"></div>
						Reversed sides
					</Label>
				</FormGroup>
			</ModalBody>
		</Modal>
	);
};

export default VetoModal;
