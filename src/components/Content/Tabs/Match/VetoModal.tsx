import React from 'react';
import { withTranslation } from 'react-i18next';
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
	t: any;
}
class VetoModal extends React.Component<Props, { isOpen: boolean }> {
	state = {
		isOpen: false
	};
	save = () => {};
	changeTypeHandler = (type: I.VetoType) => () => {
		this.props.onChange('type', this.props.map, type);
	};
	render() {
		const t = this.props.t;
		return (
			<Modal isOpen={this.props.isOpen} toggle={this.props.toggle} className="veto_modal">
				<ModalHeader toggle={this.props.toggle}>Edit Veto {this.props.map + 1}</ModalHeader>
				<div className="veto_type">
					<div
						className={`type pick ${this.props.veto.type === 'pick' ? 'active' : ''}`}
						onClick={this.changeTypeHandler('pick')}
					>
						{t('match.vetoType.pick').toUpperCase()}
					</div>
					<div
						className={`type ban ${this.props.veto.type === 'ban' ? 'active' : ''}`}
						onClick={this.changeTypeHandler('ban')}
					>
						{t('match.vetoType.ban').toUpperCase()}
					</div>
					<div
						className={`type decider ${this.props.veto.type === 'decider' ? 'active' : ''}`}
						onClick={this.changeTypeHandler('decider')}
					>
						{t('match.vetoType.decider').toUpperCase()}
					</div>
				</div>
				<ModalBody>
					{this.props.veto.type !== 'decider' ? (
						<>
							<FormGroup>
								<Input
									type="select"
									name="teams"
									id="teams"
									value={this.props.veto.teamId}
									onChange={e => this.props.onChange('teamId', this.props.map, e.target.value)}
								>
									<option value="">{t('common.noTeam')}</option>
									{this.props.teams.map(teams => (
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
									value={this.props.veto.side}
									onChange={e => this.props.onChange('side', this.props.map, e.target.value)}
								>
									<option value={'NO'} disabled defaultChecked>
										{t('match.questionOpponentPick')}
									</option>
									<option value={'NO'}>{t('common.no')}</option>
									<option value={'CT'}>{t('common.ct')}</option>
									<option value={'T'}>{t('common.t')}</option>
								</Input>
							</FormGroup>
						</>
					) : null}
					<FormGroup>
						<Input
							type="select"
							name="type"
							id="type"
							value={this.props.veto.mapName}
							onChange={e => this.props.onChange('mapName', this.props.map, e.target.value)}
						>
							<option value="" disabled defaultChecked>
								{t('common.map')}
							</option>
							{this.props.maps.map(map => (
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
								onChange={e => this.props.onChange('reverseSide', this.props.map, e.target.checked)}
								checked={this.props.veto.reverseSide || false}
							/>{' '}
							<div className="customCheckbox"></div>
							{t('match.reversedSides')}
						</Label>
					</FormGroup>
				</ModalBody>
			</Modal>
		);
	}
}

export default withTranslation()(VetoModal);
