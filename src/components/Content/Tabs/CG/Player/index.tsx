import React, { useState } from 'react';
import Section from '../Section';
import { Row, Col, FormGroup, Input, FormText } from 'reactstrap';
import countries from '../../../countries';
import DragFileInput from '../../../../DragFileInput';
import { IContextData } from '../../../../Context';
import { useTranslation } from 'react-i18next';
import * as I from './../../../../../api/interfaces';
import { hash } from '../../../../../hash';
import isSvg from '../../../../../isSvg';
import { clone } from '../../../../../api/api';

interface Props {
	cxt: IContextData;
}

const PlayerForm = ({ cxt }: Props) => {
	const { t } = useTranslation();

	const [playerForm, setPlayerForm] = useState<I.Player | null>(null);

	const setPlayerToEdit = (e: any) => {
		const id = e.target.value;
		const player = cxt.players.find(player => player._id === id);

		setPlayerForm(player ? clone(player) : null);
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

	const gameIdentifier = cxt.game === 'csgo' ? 'SteamID64' : 'In-game name';

	return (
		<Section title="Players" cxt={cxt}>
			<Row>
				<Col md="12">
					<FormGroup>
						<Input
							type="select"
							name="player"
							value={(playerForm && playerForm._id) || undefined}
							onChange={setPlayerToEdit}
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
							//onChange={onChange}
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
							//onChange={onChange}
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
							//onChange={onChange}
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
							//onChange={onChange}
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
							//onChange={onChange}
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
							/*onChange={onChange}*/
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
							onChange={() => {}}
							id="cg-player-avatar"
							label={t('players.uploadProfile').toUpperCase()}
							imgSrc={avatar}
							removable
						/>
						<FormText color="muted">{t('players.avatarInfo')}</FormText>
					</FormGroup>
				</Col>
			</Row>
		</Section>
	);
};

export default PlayerForm;
