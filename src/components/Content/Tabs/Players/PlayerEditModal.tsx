import React from 'react';
import { Modal, ModalHeader, ModalBody, Button, FormGroup, Input, ModalFooter, Row, Col, FormText } from 'reactstrap';
import { hash } from '../../../../hash';
import isSvg from '../../../../isSvg';
import DragFileInput from '../../../DragFileInput';
import * as I from './../../../../api/interfaces';
import countries from './../../countries';
import { IContextData } from './../../../../components/Context';
import ColorPicker from '../../../ColorPicker/ColorPicker';
import { getMatchName } from '../../../../utils';

interface IProps {
	open: boolean;
	toggle: () => void;
	player: I.Player;
	teams: I.Team[];
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onExtraChange: I.onExtraChangeFunction;
	onFileChange: (files: FileList) => void;
	save: () => void;
	deletePlayer: () => void;
	fields: I.CustomFieldEntry[];
	cxt: IContextData;
}

const PlayerEditModal = ({
	open,
	toggle,
	player,
	teams,
	onChange,
	onFileChange,
	save,
	deletePlayer,
	fields,
	onExtraChange,
	cxt
}: IProps) => {
	let avatar = '';
	if (player.avatar) {
		if (player.avatar.includes('api/players/avatar')) {
			avatar = `${player.avatar}?hash=${hash()}`;
		} else {
			const encoding = isSvg(Buffer.from(player.avatar, 'base64')) ? 'svg+xml' : 'png';
			avatar = `data:image/${encoding};base64,${player.avatar}`;
		}
	}
	const renderInput = (
		field: string,
		type: Exclude<I.PanelInputType, 'select' | 'action' | 'checkbox'>,
		value: any
	) => {
		const getSelects = (type: 'match' | 'team' | 'player') => {
			if (type === 'team') {
				return cxt.teams
					.concat()
					.sort((a, b) => (a.name < b.name ? -1 : 1))
					.map(team => (
						<option key={team._id} value={team._id}>
							{team.name}
						</option>
					));
			} else if (type === 'match') {
				return cxt.matches.map(match => (
					<option key={match.id} value={match.id}>
						{getMatchName(match, cxt.teams, true)}
					</option>
				));
			}
			return cxt.players
				.concat()
				.sort((a, b) => (a.username < b.username ? -1 : 1))
				.map(player => (
					<option key={player._id} value={player._id}>
						{player.username}
					</option>
				));
		};
		switch (type) {
			case 'match':
			case 'team':
			case 'player':
				return (
					<Input type="select" name={field} value={value} onChange={onExtraChange(field, type)}>
						<option value="">Field: {field}</option>
						{getSelects(type)}
					</Input>
				);
			case 'text':
				return (
					<Input
						type="text"
						name={field}
						onChange={onExtraChange(field, type)}
						value={value}
						placeholder={`Field: ${field}`}
					/>
				);
			case 'image': {
				return (
					<DragFileInput
						image
						removable
						id={`file_${field}`}
						onChange={onExtraChange(field, type)}
						label={`Field: ${field}`}
						imgSrc={
							value
								? `data:image/${
										isSvg(Buffer.from(value, 'base64')) ? 'svg+xml' : 'png'
								  };base64,${value}`
								: value
						}
					/>
				);
			}
			case 'color':
				return <ColorPicker hex={value} setHex={onExtraChange(field, type)} />;
		}
	};
	const extraForm = () =>
		fields.map(field => (
			<Row key={field._id}>
				<Col md="12">
					<FormGroup>{renderInput(field.name, field.type, player.extra[field.name])}</FormGroup>
				</Col>
			</Row>
		));
	const playerForm = () => (
		<>
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
			{extraForm()}
			<Row className="centered">
				{player._id !== 'empty' ? (
					<Button className="purple-btn round-btn" onClick={deletePlayer}>
						Delete
					</Button>
				) : null}
			</Row>
		</>
	);
	return (
		<Modal isOpen={open} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>Edit a player</ModalHeader>
			<ModalBody>{playerForm()}</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" className="modal-save" onClick={save}>
					Save
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default PlayerEditModal;
