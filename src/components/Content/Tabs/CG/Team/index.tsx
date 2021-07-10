import React, { useState } from 'react';
import Section from '../Section';
import { Row, Col, FormGroup, Input, FormText } from 'reactstrap';
import { IContextData } from '../../../../Context';
import { useTranslation } from 'react-i18next';
import * as I from './../../../../../api/interfaces';
import { clone } from '../../../../../api/api';
import countries from '../../../countries';
import DragFileInput from '../../../../DragFileInput';
import { hash } from '../../../../../hash';
import isSvg from '../../../../../isSvg';

interface Props {
    cxt: IContextData
}

const TeamForm = ({ cxt }: Props) => {
    const { t } = useTranslation();

    const [teamForm, setTeamForm] = useState<I.Team | null>(null);

    const setTeamToEdit = (e: any) => {
        const id = e.target.value;
        const team = cxt.teams.find(team => team._id === id);

        setTeamForm(team ? clone(team) : null);
    }


	let logo = '';
	if (teamForm?.logo) {
		if (teamForm.logo.includes('api/teams/logo')) {
			logo = `${teamForm.logo}?hash=${hash()}`;
		} else {
			const encoding = isSvg(Buffer.from(teamForm.logo, 'base64')) ? 'svg+xml' : 'png';
			logo = `data:image/${encoding};base64,${teamForm.logo}`;
		}
	}

    return (
        <Section title="Teams" cxt={cxt}>
            <Row>
                <Col md="12">
                    <FormGroup>
                        <Input type="select" name="team" value={teamForm && teamForm._id || undefined} onChange={setTeamToEdit}>
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
                            //onChange={onChange}
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
                            //onChange={onChange}
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
                        <DragFileInput
                            image
                            onChange={() => {}}
                            id="cg-team-team_logo"
                            removable
                            label={t('teams.uploadLogo')}
                            imgSrc={logo || undefined}
                        />
                        <FormText color="muted">{t('teams.logoInfo')}</FormText>
                    </FormGroup>
                </Col>
            </Row>
        </Section>)
}

export default TeamForm;