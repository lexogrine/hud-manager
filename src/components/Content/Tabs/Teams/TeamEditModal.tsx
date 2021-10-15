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
	team: I.Team;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onExtraChange: I.onExtraChangeFunction;
	onFileChange: (files: FileList) => void;
	save: () => void;
	fields: I.CustomFieldEntry[];
	deleteTeam: () => void;
	cxt: IContextData;
}

const TeamEditModal = ({ team, onChange, onFileChange, save, toggle, onExtraChange, fields, cxt }: IProps) => {
	let logo = '';
	if (team.logo) {
		if (team.logo.includes('api/teams/logo')) {
			logo = `${team.logo}?hash=${hash()}`;
		} else {
			const encoding = isSvg(Buffer.from(team.logo, 'base64')) ? 'svg+xml' : 'png';
			logo = `data:image/${encoding};base64,${team.logo}`;
		}
	}
	const { t } = useTranslation();
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
					<FormGroup>{renderInput(field.name, field.type, team.extra?.[field.name])}</FormGroup>
				</Col>
			</Row>
		));
	return (
		<>
			<div className="tab-content-container no-padding">
				<div className="edit-form">
					<div className="main-form">
						<FormText color="muted">
							{t('common.team')}: {team._id || '--- NONE ---'}
						</FormText>
						<LabeledInput
							type="text"
							name="name"
							label="Team Name"
							id="team_name"
							value={team.name}
							onChange={onChange}
							placeholder={t('common.teamName')}
						/>
						<LabeledInput
							type="text"
							name="shortName"
							id="short_name"
							label="Short name"
							value={team.shortName || ''}
							onChange={onChange}
							placeholder={t('common.shortName')}
						/>
						<LabeledInput
							label={t('common.country')}
							type="select"
							id="country"
							name="country"
							value={team.country}
							onChange={onChange}
						>
							<option value="">{t('common.country')}</option>
							{countries.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</LabeledInput>
						<DragFileInput
							image
							onChange={onFileChange}
							id="team_logo"
							removable
							label={t('teams.uploadLogo')}
							imgSrc={logo || undefined}
						/>
						<FormText color="muted">{t('teams.logoInfo')}</FormText>
						{extraForm()}
					</div>
				</div>
			</div>
			<div className="action-container">
				{team._id !== 'empty' ? (
					<div className="button green empty big wide" onClick={toggle}>
						Delete
					</div>
				) : null}
				<div className="button green empty big wide" onClick={toggle}>
					Cancel
				</div>
				<div className="button green strong big wide" onClick={save}>
					{t(team._id !== 'empty' ? 'common.save' : 'teams.addTeam')}
				</div>
			</div>
		</>
	);
};

export default TeamEditModal;
