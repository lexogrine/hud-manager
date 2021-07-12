import React, { useState } from 'react';
import Section from '../Section';
import { Row, Col, FormGroup, Input, FormText, Button } from 'reactstrap';
import countries from '../../../countries';
import DragFileInput from '../../../../DragFileInput';
import { IContextData } from '../../../../Context';
import { useTranslation } from 'react-i18next';
import * as I from './../../../../../api/interfaces';
import { hash } from '../../../../../hash';
import isSvg from '../../../../../isSvg';
import api, { clone } from '../../../../../api/api';

interface Props {
	cxt: IContextData;
}

const PlayerForm = ({ cxt }: Props) => {
	const emptyPlayer: I.Player = {
		_id: 'empty',
		firstName: '',
		lastName: '',
		username: '',
		avatar: '',
		country: '',
		game: cxt.game,
		steamid: '',
		team: '',
		extra: {}
	};

	const { t } = useTranslation();

	const [playerForm, setPlayerForm] = useState<I.Player>(clone(emptyPlayer));

	const setPlayerToEdit = (id: string) => {
		const player = cxt.players.find(player => player._id === id);

		setPlayerForm(clone(player || emptyPlayer));
	};

	let avatar = '';
	if (playerForm?.avatar) {
		if (playerForm.avatar.includes('api/players/avatar')) {
			avatar = `${playerForm.avatar}?hash=${hash()}`;
		} else {
			const encoding = isSvg(Buffer.from(playerForm.avatar, 'base64')) ? 'svg+xml' : 'png';
			avatar = `data:image/${encoding};base64,${playerForm.avatar}`;
		}
	}

	const setPlayerField = (field: keyof I.Player) => (e: any) => {
		if (!playerForm) return;
		const { value } = e.target;
		setPlayerForm({ ...playerForm, [field]: value });
	};

	const gameIdentifier = cxt.game === 'csgo' || cxt.game === 'dota2' ? 'SteamID64' : 'In-game name';

	const fileHandler = (files: FileList) => {
		if (!files) return;
		const file = files[0];
		if (!file) {
			setPlayerForm(prevForm => ({ ...prevForm, avatar: '' }));
			return;
		}
		if (!file.type.startsWith('image')) {
			return;
		}
		const reader: any = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			setPlayerForm(prevForm => ({
				...prevForm,
				avatar: reader.result.replace(/^data:([a-z]+)\/(.+);base64,/, '')
			}));
		};
	};

	const updatePlayer = async () => {
		if (!playerForm) return;
		const form = { ...playerForm };
		if (form._id === 'empty') {
			const response = (await api.players.add(form)) as any;
			if (response && response._id) {
				await cxt.reload();
				setPlayerToEdit(response._id);
			}
		} else {
			let avatar = form.avatar;
			if (avatar && avatar.includes('api/players/avatar')) {
				avatar = undefined as any;
			}

			await api.players.update(form._id, { ...form, avatar });
			cxt.reload();
		}
	};

	/*useEffect(() => {
		updatePlayer();
	}, [])*/

	return (
		<Section title="Players" cxt={cxt} width={400}>
			<Row>
				<Col md="12">
					<FormGroup>
						<Input
							type="select"
							name="player"
							value={(playerForm && playerForm._id) || undefined}
							onChange={e => setPlayerToEdit(e.target.value)}
						>
							<option value="">{t('common.player')}</option>
							{cxt.players
								.concat()
								.sort((a, b) => (a.username < b.username ? -1 : 1))
								.map(player => (
									<option key={player._id} value={player._id}>
										{player.firstName} &quot;{player.username}&quot; {player.lastName}
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
							type="text"
							name="firstName"
							id="cg-player-first_name"
							onChange={setPlayerField('firstName')}
							value={playerForm?.firstName}
							placeholder={t('common.firstName')}
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
							id="cg-player-last_name"
							onChange={setPlayerField('lastName')}
							value={playerForm?.lastName}
							placeholder={t('common.lastName')}
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
							id="cg-player-nick"
							onChange={setPlayerField('username')}
							value={playerForm?.username}
							placeholder={t('common.nickname')}
						/>
					</FormGroup>
				</Col>
			</Row>
			<Row>
				<Col md="12">
					<FormGroup>
						<Input
							type="select"
							id="cg-player-country"
							name="country"
							value={playerForm?.country}
							onChange={setPlayerField('country')}
						>
							<option value="">{t('common.country')}</option>
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
							id="cg-player-steamid"
							type="text"
							name="steamid"
							value={playerForm?.steamid}
							onChange={setPlayerField('steamid')}
							placeholder={gameIdentifier}
						/>
					</FormGroup>
				</Col>
			</Row>
			<Row>
				<Col md="12">
					<FormGroup>
						<Input
							type="select"
							id="cg-player-player_teams"
							name="team"
							value={playerForm?.team}
							onChange={setPlayerField('team')}
						>
							<option value="">{t('common.team')}</option>
							{cxt.teams
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
							onChange={fileHandler}
							id="cg-player-avatar"
							label={t('players.uploadProfile').toUpperCase()}
							imgSrc={avatar}
							removable
						/>
						<FormText color="muted">{t('players.avatarInfo')}</FormText>
					</FormGroup>
				</Col>
			</Row>
			<Row>
				<Col s={12}>
					<Button color="primary" className="modal-save" onClick={updatePlayer}>
						{t('common.save')}
					</Button>
				</Col>
			</Row>
		</Section>
	);
};

export default PlayerForm;
