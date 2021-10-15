import { FormGroup, Input, Row, Col, FormText } from 'reactstrap';
import { hash } from '../../../../hash';
import isSvg from '../../../../isSvg';
import DragFileInput from '../../../DragFileInput';
import * as I from './../../../../api/interfaces';
import countries from './../../countries';
import { IContextData } from './../../../../components/Context';
import ColorPicker from '../../../ColorPicker/ColorPicker';
import { getMatchName } from '../../../../utils';
import { useTranslation } from 'react-i18next';
import LabeledInput from '../../../LabeledInput';

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
	toggle,
	player,
	teams,
	deletePlayer,
	onChange,
	onFileChange,
	save,
	fields,
	onExtraChange,
	cxt
}: IProps) => {
	const { t } = useTranslation();
	let avatar = '';
	if (player.avatar) {
		if (player.avatar.includes('api/players/avatar')) {
			avatar = `${player.avatar}?hash=${hash()}`;
		} else {
			const encoding = isSvg(Buffer.from(player.avatar, 'base64')) ? 'svg+xml' : 'png';
			avatar = `data:image/${encoding};base64,${player.avatar}`;
		}
	}
	const gameIdentifier = cxt.game === 'csgo' || cxt.game === 'dota2' ? 'SteamID64' : 'In-game name';
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
					<FormGroup>{renderInput(field.name, field.type, player.extra?.[field.name])}</FormGroup>
				</Col>
			</Row>
		));
	return (
		<>
			<div className="tab-content-container no-padding">
				<div className="edit-form">
					<div className="main-form">
						<LabeledInput
							type="text"
							name="firstName"
							id="first_name"
							onChange={onChange}
							value={player.firstName}
							label={t('common.firstName')}
							placeholder={t('common.firstName')}
						/>
						<LabeledInput
							type="text"
							name="lastName"
							id="last_name"
							label={t('common.lastName')}
							onChange={onChange}
							value={player.lastName}
							placeholder={t('common.lastName')}
						/>
						<LabeledInput
							type="text"
							name="username"
							id="nick"
							onChange={onChange}
							label={t('common.nickname')}
							value={player.username}
							placeholder={t('common.nickname')}
						/>
						<LabeledInput
							label={t('common.country')}
							type="select"
							id="country"
							name="country"
							value={player.country}
							onChange={onChange}
						>
							<option value="">{t('common.country')}</option>
							{countries.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</LabeledInput>
						<Input
							id="steamid"
							type="text"
							name="steamid"
							value={player.steamid}
							onChange={onChange}
							placeholder={gameIdentifier}
						/>
						<LabeledInput
							label={t('common.team')}
							type="select"
							id="player_teams"
							name="team"
							value={player.team}
							onChange={onChange}
						>
							<option value="">{t('common.team')}</option>
							{teams
								.concat()
								.sort((a, b) => (a.name < b.name ? -1 : 1))
								.map(team => (
									<option key={team._id} value={team._id}>
										{team.name}
									</option>
								))}
						</LabeledInput>
						<DragFileInput
							image
							onChange={onFileChange}
							id="avatar"
							label={t('players.uploadProfile').toUpperCase()}
							imgSrc={avatar}
							removable
						/>
						<FormText color="muted">{t('players.avatarInfo')}</FormText>
						{extraForm()}
					</div>
				</div>
			</div>
			<div className="action-container">
				{player._id !== 'empty' ? (
					<div className="button green empty big wide" onClick={deletePlayer}>
						Delete
					</div>
				) : null}
				<div className="button green empty big wide" onClick={toggle}>
					Cancel
				</div>
				<div className="button green strong big wide" onClick={save}>
					{t(player._id !== 'empty' ? 'common.save' : 'players.addPlayer')}
				</div>
			</div>
		</>
	);
};

export default PlayerEditModal;
