import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Input } from 'reactstrap';
import * as I from './../../../../api/interfaces';

interface Props {
	isOpen: boolean;
	toggle: () => void;
	side: 'right' | 'left';
	teams: I.Team[];
	team: any;
	onSave: Function;
}

interface State {
	form: {
		id: string;
		wins: 0;
	};
}

class SetTeamModal extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			form: { ...this.props.team }
		};
	}
	save = () => {
		if (this.state.form.id === 'empty') {
			this.props.onSave(this.props.side, null, this.state.form.wins);
			this.props.toggle();
			return;
		}
		this.props.onSave(this.props.side, this.state.form.id, this.state.form.wins);
		this.props.toggle();
	};

	changeHandler = (name: string) => (event: any) => {
		const { form }: any = this.state;
		form[name] = name === "wins" ? Number(event.target.value) : event.target.value;
		this.setState({ form });
	};
	render() {
		return (
			<Modal isOpen={this.props.isOpen} toggle={this.props.toggle} className={'veto_modal'}>
				<ModalHeader toggle={this.props.toggle}>TEAM #{this.props.side === 'left' ? 1 : 2}</ModalHeader>
				<ModalBody>
					<FormGroup>
						<Input
							type="select"
							name="teams"
							id="teams"
							value={this.state.form.id}
							onChange={this.changeHandler('id')}
						>
							<option value={'empty'}>Empty team</option>
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
							name="wins"
							id="wins"
							value={this.state.form.wins}
							onChange={this.changeHandler('wins')}
						>
							<option value={0}>0</option>
							<option value={1}>1</option>
							<option value={2}>2</option>
							<option value={3}>3</option>
						</Input>
					</FormGroup>
				</ModalBody>
				<ModalFooter className="no-padding">
					<Button color="primary" onClick={this.save} className="modal-save">
						Save
					</Button>
				</ModalFooter>
			</Modal>
		);
	}
}

class TeamModal extends React.Component<
	{ button: JSX.Element; side: 'right' | 'left'; team: any; teams: I.Team[]; onSave: Function },
	{ isOpen: boolean }
> {
	state = {
		isOpen: false
	};
	toggle = () => {
		this.setState({ isOpen: !this.state.isOpen });
	};
	setOnPress = (element: JSX.Element) => {
		return React.cloneElement(element, { onClick: this.toggle });
	};
	render() {
		return (
			<React.Fragment>
				{this.setOnPress(this.props.button)}
				<SetTeamModal
					isOpen={this.state.isOpen}
					toggle={this.toggle}
					side={this.props.side}
					team={this.props.team}
					teams={this.props.teams}
					onSave={this.props.onSave}
				/>
			</React.Fragment>
		);
	}
}

export default TeamModal;
