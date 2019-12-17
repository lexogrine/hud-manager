import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Card, CardBody } from 'reactstrap';
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
export default class VetoModal extends React.Component<Props, { isOpen:boolean }> {
	state = {
		isOpen: false
	}
	save = () => {

	}
	render() {
		
		return (
			<Modal isOpen={this.props.isOpen} toggle={this.props.toggle} >
				<ModalHeader toggle={this.props.toggle}>VETO #{this.props.map+1}</ModalHeader>
				<ModalBody>
					<FormGroup>
						<Label for="players">Team</Label>
						<Input type="select" name="teams" id="teams" value={this.props.veto.teamId} onChange={this.props.onChange('teamId', this.props.map)}>
							<option value="">No pick</option>
							{this.props.teams.map(teams => <option key={teams._id} value={teams._id}>{teams.name}</option>)}
						</Input>
					</FormGroup>
					<FormGroup>
						<Label for="type">Picks / Bans</Label>
						<Input type="select" name="type" id="type" value={this.props.veto.type} onChange={this.props.onChange('type', this.props.map)}>
							<option value={"pick"}>Pick</option>
							<option value={"ban"}>Ban</option>
						</Input>
					</FormGroup>
					<FormGroup>
						<Label for="type">Map</Label>
						<Input type="select" name="type" id="type" value={this.props.veto.mapName} onChange={this.props.onChange('mapName', this.props.map)}>
							<option value="" disabled defaultChecked>No map</option>
							{maps.map(map => <option value={map} key={map}>{map.replace("de_", "")[0].toUpperCase()}{map.replace("de_", "").substr(1)}</option>)}
						</Input>
					</FormGroup>
					<FormGroup>
						<Label for="type">Does opponent pick a side?</Label>
						<Input type="select" name="side" id="side" value={this.props.veto.side} onChange={this.props.onChange('side', this.props.map)}>
							<option value={"NO"}>No</option>
							<option value={"CT"}>CT</option>
							<option value={"T"}>T</option>
						</Input>
					</FormGroup>
					<FormGroup check>
					<Label check>
						<Input type="checkbox" onChange={this.props.onChange('reverseSide', this.props.map)} checked={this.props.veto.reverseSide || false}/>{' '}
							Side's reversed?
						</Label>
					</FormGroup>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={this.props.toggle}>Save</Button>
				</ModalFooter>
			</Modal>
		);
	}
}