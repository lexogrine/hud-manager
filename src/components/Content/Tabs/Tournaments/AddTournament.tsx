import React from 'react';
import { Modal, ModalHeader, ModalBody, Button, FormGroup, Input, ModalFooter, Row, Col, FormText } from 'reactstrap';
import DragFileInput from '../../../DragFileInput';
import api from '../../../../api/api';
import isSvg from '../../../../isSvg';
import { hash } from '../../../../hash';
import { withTranslation } from 'react-i18next';

interface Props {
	isOpen: boolean;
	toggle: any;
	reload: any;
	changeHandler: any;
	fileHandler: any;
	form: {
		name: string;
		type: 'se' | 'de';
		teams: number;
		logo: string;
		_id: string;
	};
	t: any;
}

interface State {
	name: string;
	type: 'se' | 'de';
	teams: number;
	logo: string;
	isLoading: boolean;
}

class AddTournamentModal extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			name: '',
			type: 'se',
			teams: 2,
			logo: '',
			isLoading: false
		};
	}

	add = async () => {
		const { form } = this.props;
		const res = form._id
			? await api.tournaments.update(form._id, { name: form.name, logo: form.logo })
			: await api.tournaments.add(this.props.form);
		if (res) {
			this.props.reload();
			this.props.toggle();
		}
	};
	render() {
		const { toggle, isOpen, t } = this.props;
		const { name, type, teams, _id } = this.props.form;
		let logo = '';
		if (this.props.form.logo) {
			if (this.props.form.logo.includes('api/players/avatar')) {
				logo = `${this.props.form.logo}?hash=${hash()}`;
			} else {
				logo = `data:image/${isSvg(Buffer.from(this.props.form.logo, 'base64')) ? 'svg+xml' : 'png'};base64,${
					this.props.form.logo
				}`;
			}
		}
		return (
			<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
				<ModalHeader toggle={toggle}>
					{this.props.form._id ? t('tournaments.edit') : t('tournaments.create')}
				</ModalHeader>
				<ModalBody>
					<Row>
						<Col md="12">
							<FormGroup>
								<Input
									type="text"
									name="name"
									id="tournament_name"
									value={name}
									onChange={this.props.changeHandler('name')}
									placeholder={t('tournaments.name')}
								/>
							</FormGroup>
						</Col>
					</Row>
					<Row>
						<Col md="12">
							<FormGroup>
								<DragFileInput
									image
									removable
									onChange={this.props.fileHandler}
									id="tournament_logo"
									label={t('tournaments.uploadLogo')}
									imgSrc={logo}
								/>
								<FormText color="muted">{t('tournaments.logoInfo')}</FormText>
								{/*<Label for="avatar">Avatar</Label>
                                <Input type="file" name="avatar" id="avatar" onChange={this.changeHandler} />
                                <FormText color="muted">
                                    Avatar to be used for player images, instead of Steam's default
                                </FormText>*/}
							</FormGroup>
						</Col>
					</Row>
					{!_id ? (
						<Row>
							<Col md="12">
								<FormGroup>
									<Input
										type="select"
										name="tournament_type"
										id="tournament_type"
										onChange={this.props.changeHandler('type')}
										value={type}
									>
										<option value={'se'}>{t('tournaments.singleElimBracket')}</option>
										<option value={'de'}>{t('tournaments.doubleElimBracket')}</option>
										<option value={''} disabled>
											{t('tournaments.swiss')} ({t('tournaments.soon')}!)
										</option>
									</Input>
								</FormGroup>
							</Col>
						</Row>
					) : null}
					{!_id ? (
						<Row>
							<Col md="12">
								<FormGroup>
									<Input
										type="select"
										name="teams_amount"
										id="teams_amount"
										onChange={this.props.changeHandler('teams')}
										value={teams}
									>
										<option value="" disabled defaultChecked>
											{t('tournaments.amountOfTeams')}
										</option>
										<option value={2}>2</option>
										<option value={4}>4</option>
										<option value={8}>8</option>
										<option value={16}>16</option>
									</Input>
								</FormGroup>
							</Col>
						</Row>
					) : null}
				</ModalBody>
				<ModalFooter className="no-padding">
					<Button color="primary" className="modal-save" onClick={this.add}>
						{t('common.save')}
					</Button>
				</ModalFooter>
			</Modal>
		);
	}
}

export default withTranslation()(AddTournamentModal);
