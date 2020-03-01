import React from 'react';
import { Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';
import * as I from './../../../../api/interfaces';

const maps = ["de_mirage", "de_dust2", "de_inferno", "de_nuke", "de_train", "de_overpass", "de_vertigo"];


interface Props {
	map: number,
	veto: I.Veto,
	teams: I.Team[],
	isOpen: boolean,
	toggle: () => void,
	onChange: (name: string, map: number) => any;
}
export default class VetoModal extends React.Component<Props, { isOpen: boolean }> {
	state = {
		isOpen: false
	}
	save = () => {

	}
	changeTypeHandler = (type: I.VetoType) => () => {
		this.props.onChange('type', this.props.map)({target:{value:type}});
	}
	render() {

		return (
			<Modal isOpen={this.props.isOpen} toggle={this.props.toggle} className="veto_modal" >
				<ModalHeader toggle={this.props.toggle}>Edit Veto {this.props.map + 1}</ModalHeader>
				<div className="veto_type">
					<div className={`type pick ${this.props.veto.type === "pick" ? "active" : ""}`} onClick={this.changeTypeHandler('pick')}>PICK</div>
					<div className={`type ban ${this.props.veto.type === "ban" ? "active" : ""}`} onClick={this.changeTypeHandler('ban')}>BAN</div>
					<div className={`type decider ${this.props.veto.type === "decider" ? "active" : ""}`} onClick={this.changeTypeHandler('decider')}>DECIDER</div>
				</div>
				<ModalBody>
					
				{
					this.props.veto.type !== "decider" ? <>
						<FormGroup>
							<Input type="select" name="teams" id="teams" value={this.props.veto.teamId} onChange={this.props.onChange('teamId', this.props.map)}>
								<option value="">Team</option>
								{this.props.teams.map(teams => <option key={teams._id} value={teams._id}>{teams.name}</option>)}
							</Input>
						</FormGroup>
						<FormGroup>
							<Input type="select" name="side" id="side" value={this.props.veto.side} onChange={this.props.onChange('side', this.props.map)}>
								<option value={"NO"} disabled defaultChecked>Does opponent pick a side?</option>
								<option value={"NO"}>No</option>
								<option value={"CT"}>CT</option>
								<option value={"T"}>T</option>
							</Input>
						</FormGroup>
					</> : null
				}
					<FormGroup>
						<Input type="select" name="type" id="type" value={this.props.veto.mapName} onChange={this.props.onChange('mapName', this.props.map)}>
							<option value="" disabled defaultChecked>Map</option>
							{maps.map(map => <option value={map} key={map}>{map.replace("de_", "")[0].toUpperCase()}{map.replace("de_", "").substr(1)}</option>)}
						</Input>
					</FormGroup>
					<FormGroup check>
						<Label check>
							<Input type="checkbox" onChange={this.props.onChange('reverseSide', this.props.map)} checked={this.props.veto.reverseSide || false} />{' '}
							<div className="customCheckbox"></div>
							Side's reversed?
						</Label>
					</FormGroup>
				</ModalBody>
			</Modal>
		);
	}
}