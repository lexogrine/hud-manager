import React, { Component } from 'react';
import api from './../../../../api/api';
import config from './../../../../api/config';
import * as I from './../../../../api/interfaces';
import { Form, FormGroup, Col, Row, Label, Collapse, CustomInput, Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
import TeamModal from './SetTeamModal';
import SingleVeto from './SingleVeto';

import { IContextData } from '../../../Context';
import { socket } from './../Live/Live';


interface State extends I.Match {
    isVetoOpen: boolean

}
export default class MatchEdit extends Component<{ cxt: IContextData, match: I.Match, edit: Function }, State> {
    constructor(props: { cxt: IContextData, match: I.Match, edit: Function }) {
        super(props);
        this.state = { ...this.props.match, isVetoOpen: false }


    }

    vetoHandler = (name: string, map: number) => (event: any) => {
        const { vetos }: any = this.state;
        const veto = { teamId: '', mapName: '', side: 'NO', ...vetos[map] };
        veto[name] = event.target.value;
        if(name === "reverseSide") veto[name] = event.target.checked;
        if (veto.teamId === "") {
            veto.mapName = "";
        }
        vetos[map] = veto;
        this.setState({ vetos }, this.save);
    }
    changeMatchType = (event: any) => {
        const vetos: I.Veto[] = [];
        for (let i = 0; i < 7; i++) {
            vetos.push({ teamId: '', mapName: '', side: 'NO', type: 'pick', mapEnd: false });
        }
        this.setState({ matchType: event.target.value, vetos });
    }
    getData = (side: 'right' | 'left', id: string, wins: number) => {
        const { state } = this;
        state[side].id = id;
        state[side].wins = wins;
        this.setState(state, () => {
            this.save();
        });
    }

    save = async () => {
        const form = { ...this.state };
        if (form.id.length) {
            delete form.isVetoOpen;
            this.props.edit(form.id, form);
        }
    }
    toggleVeto = () => {
        this.setState({ isVetoOpen: !this.state.isVetoOpen });
    }
    async componentDidMount() {
        if (!this.state.id.length) return;
        socket.on('match', async () => {
            const matches = await api.match.get();
            const current = matches.filter(match => match.id === this.state.id)[0];
            if (!current) return;
            this.setState({ vetos: current.vetos });
        })
    }

    render() {
        const { match, cxt } = this.props;
        const teams = cxt.teams.filter(team => [this.state.left.id, this.state.right.id].includes(team._id));
        const leftTeam = match && teams.filter(team => team._id === match.left.id)[0];
        const rightTeam = match && teams.filter(team => team._id === match.right.id)[0];
        return (
            <Form>
                <Row>
                    <Col md="12">
                        <FormGroup>
                            <Label for="match_type">Match Type</Label>
                            <CustomInput
                                type="select"
                                id="matchType"
                                name="matchType"
                                onChange={this.changeMatchType}
                                value={this.state.matchType}
                            >
                                <option value="bo1">BO1</option>
                                <option value="bo2">BO2</option>
                                <option value="bo3">BO3</option>
                                <option value="bo5">BO5</option>
                            </CustomInput>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="5">
                        <Card>
                            <CardBody>
                                <CardTitle className="team-data">
                                    {leftTeam && leftTeam.logo ? <img src={`data:image/jpeg;base64,${leftTeam.logo}`} className='smallLogo' /> : ''}
                                    {leftTeam && leftTeam.name || "Team One"}
                                </CardTitle>
                                <CardSubtitle>Won {this.state.left.wins} maps</CardSubtitle>
                                <TeamModal
                                    button={<Button>SET</Button>}
                                    side='left'
                                    team={this.state.left}
                                    teams={cxt.teams}
                                    matchType={this.state.matchType}
                                    onSave={this.getData}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md="2" className={'centered'}>
                        VS
                    </Col>
                    <Col md="5">
                        <Card>
                            <CardBody>
                                <CardTitle className="team-data">
                                    {rightTeam && rightTeam.logo ? <img src={`data:image/jpeg;base64,${rightTeam.logo}`} className='smallLogo' /> : ''}
                                    {rightTeam && rightTeam.name || "Team Two"}
                                </CardTitle>
                                <CardSubtitle>Won {this.state.right.wins} maps</CardSubtitle>
                                <TeamModal
                                    button={<Button>SET</Button>}
                                    side='right'
                                    team={this.state.right}
                                    teams={cxt.teams}
                                    matchType={this.state.matchType}
                                    onSave={this.getData}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col s={12} className="second-options centered">
                        <Button color="primary" onClick={this.toggleVeto}>Manage Vetos</Button>
                    </Col>
                </Row>
                <Row>
                    <Col s={12}>
                        <Collapse isOpen={this.state.isVetoOpen}>
                            {this.state.vetos.map((veto, i) => <SingleVeto key={i} map={i} onSave={this.vetoHandler} veto={veto} teams={teams} match={this.state} />)}
                        </Collapse>
                    </Col>
                </Row>
            </Form>
        )
    }
}
