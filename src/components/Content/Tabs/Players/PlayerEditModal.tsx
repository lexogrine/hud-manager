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
	player: I.Player;
	teams: I.Team[];
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onFileChange: (files: FileList) => void;
	save: () => void;
	deletePlayer: () => void;
}

const PlayerEditModal = ({ open, toggle, player, teams, onChange, onFileChange, save, deletePlayer }: IProps) => {
	let avatar = '';
	if (player.avatar) {
		if (player.avatar.includes('api/players/avatar')) {
			avatar = `${player.avatar}?hash=${hash()}`;
		} else {
			const encoding = isSvg(Buffer.from(player.avatar, 'base64')) ? 'svg+xml' : 'png';
			avatar = `data:image/${encoding};base64,${player.avatar}`;
		}
	}
	return (
		<Modal isOpen={open} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>Edit a player</ModalHeader>
			<ModalBody>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input
								type="text"
								name="firstName"
								id="first_name"
								onChange={onChange}
								value={player.firstName}
								placeholder="First Name"
							/>
						</FormGroup>
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input
								type="text"
								name="lastName"
								id="last_name"
								onChange={onChange}
								value={player.lastName}
								placeholder="Last Name"
							/>
						</FormGroup>
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input
								type="text"
								name="username"
								id="nick"
								onChange={onChange}
								value={player.username}
								placeholder="Nickname"
							/>
						</FormGroup>
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input type="select" id="country" name="country" value={player.country} onChange={onChange}>
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
							<Input
								id="steamid"
								type="text"
								name="steamid"
								value={player.steamid}
								onChange={onChange}
								placeholder="SteamID64"
							/>
						</FormGroup>
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<FormGroup>
							<Input type="select" id="player_teams" name="team" value={player.team} onChange={onChange}>
								<option value="">Team</option>
								{teams
									.concat()
									.sort((a, b) => (a.name < b.name ? -1 : 1))
									.map(team => (
										<option key={team._id} value={team._id}>
											{team.name}
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
								id="avatar"
								label="UPLOAD PROFILE PICTURE"
								imgSrc={avatar}
								removable
							/>
							<FormText color="muted">
								Avatar to be used for player images instead of the default from Steam
							</FormText>
						</FormGroup>
					</Col>
				</Row>
				{player._id !== 'empty' ? (
					<Row className="centered">
						<Button className="purple-btn round-btn" onClick={deletePlayer}>
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

export default PlayerEditModal;
