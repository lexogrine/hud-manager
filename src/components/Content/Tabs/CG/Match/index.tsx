import React, { useState, useEffect } from 'react';
import Section from '../Section';
import { Row, Col, FormGroup, Input } from 'reactstrap';
import { IContextData } from '../../../../Context';
import { useTranslation } from 'react-i18next';
import api from '../../../../../api/api';
import * as I from './../../../../../api/interfaces';
import moment from 'moment';

interface Props {
    cxt: IContextData
}

const CurrentMatchForm = ({ cxt }: Props) => {
    const { t } = useTranslation();
    const currentMatch = cxt.matches.find(match => match.current);
    const [maps, setMaps] = useState<string[]>([]);



    useEffect(() => {
        api.match.getMaps().then(maps => {
            setMaps(maps);
        });
    }, []);

    const teams: I.Team[] = [];

    if (currentMatch) {
        for (const veto of currentMatch.vetos) {
            const index = currentMatch.vetos.indexOf(veto);

            if (!veto.mapName) {
                currentMatch.vetos[index] = {
                    teamId: "",
                    mapName: "",
                    side: "NO",
                    mapEnd: false,
                    type: "pick"
                }
            }
        }
        
        if(currentMatch.left.id){
            const leftTeam = cxt.teams.find(team => team._id === currentMatch.left.id);
            if(leftTeam) teams.push(leftTeam);
        }
        
        if(currentMatch.right.id){
            const rightTeam = cxt.teams.find(team => team._id === currentMatch.right.id);
            if(rightTeam) teams.push(rightTeam);
        }
    }



    return (
        <Section title="Match" cxt={cxt} width={450}>
            {currentMatch ? (
                <>

                    <Row>
                        <Col md="6">
                            <FormGroup>
                                <Input type="select" name="team" value={currentMatch.left.id || undefined} >
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
                        <Col md="6">
                            <FormGroup>
                                <Input type="select" name="team" value={currentMatch.right.id || undefined}>
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
                                    type="datetime-local"
                                    value={
                                        currentMatch.startTime
                                            ? moment(currentMatch.startTime).format(moment.HTML5_FMT.DATETIME_LOCAL)
                                            : ''
                                    }
                                //onChange={changeStartTime}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    {currentMatch.vetos.map((veto, i) => (
                        <Row key={veto.mapName + veto.teamId + i} className="veto-list">
                            <Col md="5" className="team-picker-container">
                                {
                                    teams.map(team => (
                                        <div key={team._id} className={`picker-button ${veto.teamId === team._id ? 'active' : ''}`}>{team.name}</div>
                                    ))
                                }
                            </Col>
                            {/*<Col md="5" className="team-picker-container">
                                <FormGroup>
                                    <Input type="select" name="team" value={veto.teamId || undefined}>
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
                                            </Col>*/}
                            <Col md="2" className="picker-container">
                                <div className={`picker-button ${veto.type === "pick" ? 'active' : ''}`}>PICK</div>
                                <div className={`picker-button ${veto.type === "ban" ? 'active' : ''}`}>BAN</div>
                                <div className={`picker-button ${veto.type === "decider" ? 'active' : ''}`}>DECIDER</div>
                            </Col>
                            <Col md="5">
                                <FormGroup>
                                    <Input type="select" name="maps" value={veto.mapName || undefined}>
                                        <option value="">{t('common.map')}</option>
                                        {maps.map(map => (
                                            <option key={map} value={map}>
                                                {map}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                    ))}
                </>
            ) : null}
        </Section>
    )
}

export default CurrentMatchForm;