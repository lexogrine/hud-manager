import { useEffect, useState } from 'react';
import Section from '../Section';
import { Row, Col, FormGroup, Input, FormText } from 'reactstrap';
import { IContextData } from '../../../../Context';
import { useTranslation } from 'react-i18next';
import * as I from './../../../../../api/interfaces';
import api, { clone, layoutEvents } from '../../../../../api/api';
import countries from '../../../countries';
import DragFileInput from '../../../../DragFileInput';
import { hash } from '../../../../../hash';
import isSvg from '../../../../../isSvg';

interface Props {
	cxt: IContextData;
}

const TeamForm = ({ cxt }: Props) => {
	const emptyTeam: I.Team = {
		_id: 'empty',
		name: '',
		shortName: '',
		country: '',
		logo: '',
		game: cxt.game,
		extra: {}
	};
	const { t } = useTranslation();

	const [teamForm, setTeamForm] = useState<I.Team>(clone(emptyTeam));

	const setTeamToEdit = (e: any) => {
		const id = e.target.value;
		const team = cxt.teams.find(team => team._id === id);

		setTeamForm(clone(team || emptyTeam));
	};

	const setTeamField = (field: keyof I.Team) => (e: any) => {
		if (!teamForm) return;
		const { value } = e.target;
		setTeamForm({ ...teamForm, [field]: value });
	};

	const fileHandler = (files: FileList) => {
		if (!files) return;
		const file = files[0];
		if (!file) {
			setTeamForm(prevForm => ({ ...prevForm, logo: '' }));
			return;
		}
		if (!file.type.startsWith('image')) {
			return;
		}
		const reader: any = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			setTeamForm(prevForm => ({ ...prevForm, logo: reader.result.replace(/^data:([a-z]+)\/(.+);base64,/, '') }));
		};
	};

	let logo = '';
	if (teamForm?.logo) {
		if (teamForm.logo.includes('api/teams/logo')) {
			logo = `${teamForm.logo}?hash=${hash()}`;
		} else {
			const encoding = isSvg(Buffer.from(teamForm.logo, 'base64')) ? 'svg+xml' : 'png';
			logo = `data:image/${encoding};base64,${teamForm.logo}`;
		}
	}

	const updateTeam = async () => {
		if (!teamForm) return;
		const form = { ...teamForm };
		if (form._id === 'empty') {
			const response = (await api.teams.add(form)) as any;
			if (response && response._id) {
				await cxt.reload();
				setTeamToEdit(response._id);
			}
		} else {
			let logo = form.logo;
			if (logo && logo.includes('api/teams/logo')) {
				logo = undefined as any;
			}

			await api.teams.update(form._id, { ...form, logo });
			cxt.reload();
		}
	};

	useEffect(() => {
		layoutEvents.on('gameChange', () => {
			setTeamForm(clone(emptyTeam));
		});
	}, []);

	return (
		<Section title="Teams" cxt={cxt} width={300} className="teams">
			<Row>
				<Col md="12">
					<FormGroup>
						<Input
							type="select"
							name="team"
							value={(teamForm && teamForm._id) || undefined}
							onChange={setTeamToEdit}
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
						<Input
							type="text"
							name="name"
							id="cg-team-team_name"
							value={teamForm?.name}
							onChange={setTeamField('name')}
							placeholder={t('common.teamName')}
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
							id="cg-team-short_name"
							value={teamForm?.shortName || ''}
							onChange={setTeamField('shortName')}
							placeholder={t('common.shortName')}
						/>
					</FormGroup>
				</Col>
			</Row>
			<Row>
				<Col md="12">
					<FormGroup>
						<Input
							type="select"
							id="cg-team-country"
							name="country"
							value={teamForm?.country}
							onChange={setTeamField('country')}
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
						<DragFileInput
							image
							onChange={fileHandler}
							id="cg-team-team_logo"
							removable
							label={t('teams.uploadLogo').toUpperCase()}
							imgSrc={logo || undefined}
						/>
						<FormText color="muted">{t('teams.logoInfo')}</FormText>
					</FormGroup>
				</Col>
			</Row>
			<Row>
				<Col s={12}>
					<div className="button green strong full" onClick={updateTeam}>
						{t('common.save')}
					</div>
				</Col>
			</Row>
		</Section>
	);
};

export default TeamForm;
