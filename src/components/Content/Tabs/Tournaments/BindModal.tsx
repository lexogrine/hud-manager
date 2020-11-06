import React from 'react';
import { Modal, ModalHeader, ModalBody, Button, FormGroup, Input, ModalFooter } from 'reactstrap';
import * as I from './../../../../api/interfaces';

interface Props {
	tournamentId: string;
	matches: I.Match[];
	isOpen: boolean;
	bindHandler: any;
	toggle: any;
	teams: I.Team[];
	matchId: string;
	save: any;
}

class BindModal extends React.Component<Props> {
	getMatchDescription = (match: I.Match) => {
		const teams = this.props.teams.filter(team => team._id === match.left.id || team._id === match.right.id);
		return `${(teams[0] && teams[0].name) || 'Team #1'} vs ${(teams[1] && teams[1].name) || 'Team #2'}`;
	};

	render() {
		const { matches, toggle, isOpen, matchId, bindHandler, save } = this.props;
		return (
			<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
				<ModalHeader toggle={toggle}>Bind match to bracket</ModalHeader>
				<ModalBody>
					<FormGroup>
						<Input type="select" name="type" id="match_to_bracket" value={matchId} onChange={bindHandler}>
							<option value="" defaultChecked>
								Match
							</option>
							{matches.map(match => (
								<option value={match.id} key={match.id}>
									{this.getMatchDescription(match)}
								</option>
							))}
						</Input>
					</FormGroup>
				</ModalBody>
				<ModalFooter className="no-padding">
					<Button color="primary" className="modal-save" onClick={save}>
						Save
					</Button>
				</ModalFooter>
			</Modal>
		);
	}
}

export default BindModal;
