import React from 'react';
import { Modal, ModalHeader, ModalBody, Button, FormGroup, Input, ModalFooter, Row, Col, FormText } from 'reactstrap';
import { hash } from '../../../../hash';
import isSvg from '../../../../isSvg';
import DragFileInput from '../../../DragFileInput';
import * as I from './../../../../api/interfaces';
import countries from './../../countries';

interface IProps {
	open: boolean;
	toggle: () => void;
	team: I.Team;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onFileChange: (files: FileList) => void;
	save: () => void;
	deleteTeam: () => void;
}

const TeamEditModal = ({ open, toggle, team, onChange, onFileChange, save, deleteTeam }: IProps) => {
	let logo = '';
	if (team.logo) {
		if (team.logo.includes('api/teams/logo')) {
			logo = `${team.logo}?hash=${hash()}`;
		} else {
			const encoding = isSvg(Buffer.from(team.logo, 'base64')) ? 'svg+xml' : 'png';
			logo = `data:image/${encoding};base64,${team.logo}`;
		}
	}
	return (
		<Modal isOpen={open} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>Edit a team</ModalHeader>
			<ModalBody>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input
								type="text"
								name="name"
								id="team_name"
								value={team.name}
								onChange={onChange}
								placeholder="Team Name"
							/>
						</FormGroup>
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input
								type="text"
								name="shortName"
								id="short_name"
								value={team.shortName || ''}
								onChange={onChange}
								placeholder="Short Name"
							/>
						</FormGroup>
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input type="select" id="country" name="country" value={team.country} onChange={onChange}>
								<option value="">Country</option>
								{countries.map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Input>
						</FormGroup>
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<FormGroup>
							<DragFileInput
								image
								onChange={onFileChange}
								id="team_logo"
								removable
								label="UPLOAD LOGO"
								imgSrc={logo || undefined}
							/>
							<FormText color="muted">
								Logo to be used for the team, if possible in the given HUD
							</FormText>
						</FormGroup>
					</Col>
				</Row>
				{team._id !== 'empty' ? (
					<Row className="centered">
						<Button className="purple-btn round-btn" onClick={deleteTeam}>
							Delete
						</Button>
					</Row>
				) : null}
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" className="modal-save" onClick={save}>
					Save
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default TeamEditModal;
