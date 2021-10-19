//import TeamEditModal from './TeamEditModal';
import { useTranslation } from 'react-i18next';
import { TournamentTypes } from '../../../../../types/interfaces';
import { hash } from '../../../../hash';
import isSvg from '../../../../isSvg';
import { IContextData } from '../../../Context';
import DragFileInput from '../../../DragFileInput';
import LabeledInput from '../../../LabeledInput';

interface IProps {
	tournament: TournamentForm;
	cxt: IContextData;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	save: () => void;
	close: () => void;
	fileHandler: (files: FileList) => void;
}

export interface TournamentForm {
	_id: string;
	name: string;
	logo: string;
	playoffTeams: number;
	groupTeams: number;
	playoffType: TournamentTypes;
	phases: number;
	groupPhases: number;
	groupType: TournamentTypes;
	participants: string[];
	groupParticipants: string[];
}

const TournamentEdit = ({ tournament, onChange, save, cxt, fileHandler, close }: IProps) => {
	const { t } = useTranslation();

	const onChangeSelect = (e: any) => {
		e.persist();
		const values = Array.from(e.target.selectedOptions, (option: any) => option.value).filter(id => !!id);
		e.target.value = values;
		onChange({ target: { name: e.target.name, value: values } } as any);
	};

	let logo = '';
	if (tournament.logo) {
		if (tournament.logo.includes('api/players/avatar')) {
			logo = `${tournament.logo}?hash=${hash()}`;
		} else {
			logo = `data:image/${isSvg(Buffer.from(tournament.logo, 'base64')) ? 'svg+xml' : 'png'};base64,${
				tournament.logo
			}`;
		}
	}
	return (
		<>
			<div className="tab-content-container no-padding">
				<div className="edit-form">
					<div className="main-form">
						<LabeledInput
							label={'Tournament name'}
							type="text"
							name="name"
							id="tournament_name"
							onChange={onChange}
							value={tournament.name}
							placeholder={t('common.firstName')}
						/>
						<DragFileInput
							image
							removable
							onChange={fileHandler}
							id="tournament_logo"
							label={t('tournaments.uploadLogo')}
							imgSrc={logo}
						/>
						<LabeledInput
							label="Playoff Type"
							type="select"
							name="playoffType"
							id="tournament_playoff_type"
							onChange={onChange}
							disabled={tournament._id !== 'empty'}
							value={tournament.playoffType}
						>
							<option value={'single'}>{t('tournaments.singleElimBracket')}</option>
							<option value={'double'}>{t('tournaments.doubleElimBracket')}</option>
							<option value={'swiss'}>{t('tournaments.swiss')}</option>
						</LabeledInput>
						{tournament.playoffType === 'swiss' ? (
							<>
								<LabeledInput
									type="number"
									label="Amount of rounds"
									name="phases"
									disabled={tournament._id !== 'empty'}
									id="tournament_playoff_phases"
									onChange={onChange}
									placeholder="Amount of rounds in playoffs"
									value={tournament.phases}
								/>
								<LabeledInput
									type="select"
									multiple
									label="Participants"
									id="playoffs_teams"
									name="participants"
									onChange={onChangeSelect}
									value={tournament.participants}
								>
									<option value="">{t('common.teams')}</option>
									{cxt.teams.concat().map(team => (
										<option key={team._id} value={team._id}>
											{team.name}
										</option>
									))}
								</LabeledInput>
							</>
						) : (
							<LabeledInput
								type="select"
								name="playoffTeams"
								label="Amount of teams"
								disabled={tournament._id !== 'empty'}
								id="tournament_playoff_teams_select"
								onChange={onChange}
								value={tournament.playoffTeams}
							>
								<option value="" disabled defaultChecked>
									{t('tournaments.amountOfTeams')}
								</option>
								<option value={2}>2</option>
								<option value={4}>4</option>
								<option value={8}>8</option>
								<option value={16}>16</option>
							</LabeledInput>
						)}
						<LabeledInput
							type="select"
							label="Group type"
							name="groupType"
							id="tournament_group_type"
							onChange={onChange}
							disabled={tournament._id !== 'empty'}
							value={tournament.groupType}
						>
							<option value={'single'}>{t('tournaments.singleElimBracket')}</option>
							<option value={'double'}>{t('tournaments.doubleElimBracket')}</option>
							<option value={'swiss'}>{t('tournaments.swiss')}</option>
						</LabeledInput>
						{tournament.groupType === 'swiss' ? (
							<>
								<LabeledInput
									type="number"
									label="Amount of rounds"
									name="groupPhases"
									disabled={tournament._id !== 'empty'}
									id="tournament_group_phases"
									placeholder="Amount of rounds in group stage"
									onChange={onChange}
									value={tournament.groupPhases}
								/>
								<LabeledInput
									type="select"
									multiple
									id="groups_teams"
									label="Participants"
									name="groupParticipants"
									disabled={tournament._id !== 'empty'}
									onChange={onChangeSelect}
									value={tournament.groupParticipants}
									style={{ height: '200px !important' }}
								>
									{cxt.teams.concat().map(team => (
										<option key={team._id} value={team._id}>
											{team.name}
										</option>
									))}
								</LabeledInput>
							</>
						) : (
							<LabeledInput
								type="select"
								name="groupTeams"
								disabled={tournament._id !== 'empty'}
								id="tournament_group_teams_select"
								label="Amount of teams"
								onChange={onChange}
								value={tournament.groupTeams}
							>
								<option value="" disabled defaultChecked>
									{t('tournaments.amountOfTeams')}
								</option>
								<option value={2}>2</option>
								<option value={4}>4</option>
								<option value={8}>8</option>
								<option value={16}>16</option>
							</LabeledInput>
						)}
					</div>
					<div className="main-form"></div>
				</div>
			</div>
			<div className="action-container">
				<div className="button green empty big wide" onClick={close}>
					Cancel
				</div>
				<div className="button green strong big wide" onClick={save}>
					{t('common.save')}
				</div>
			</div>
		</>
	);
};

export default TournamentEdit;
