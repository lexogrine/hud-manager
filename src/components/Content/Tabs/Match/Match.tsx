import React, { Component } from 'react';
import api from './../../../../api/api';
import config from './../../../../api/config';
import * as I from './../../../../api/interfaces';
import { Form, FormGroup, Col, Row, Label, CustomInput, Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
import TeamModal from './SetTeamModal';

import { IContextData } from '../../../Context';


interface Props extends I.Match {
    logos: {
        left: string | null,
        right: string | null
    }
    
}
export default class Match extends Component<{cxt: IContextData}, Props> {
    constructor(props: {cxt: IContextData}) {
        super(props);
        this.state = {
            left: {
                id: 'empty',
                wins: 0
            },
            right: {
                id: 'empty',
                wins: 0
            },
            matchType: 'bo1',
            vetos: [],
            logos: {
                left: null,
                right: null
            }
        }
    }

    changeMatchType = (event: any) => {
        this.setState({matchType: event.target.value});
    }
    getData = (side: 'right'|'left', id: string, wins: number) => {
        const { state } = this;
        state[side].id = id;
        state[side].wins = wins;
        this.setState(state);
        api.files.imgToBase64(`${config.apiAddress}api/teams/logo/${id}`).then(graphic => {
            if(!graphic){
                return;
            }
            const { logos } = this.state;
            logos[side] = graphic;
            this.setState({logos});
        });
    }

    save = async () => {
        const form = {...this.state};
        const response = await api.match.set(form);
    }
    checkLogos = () => {
        const sides: ['left','right'] = ['left', 'right']
        sides.forEach(side => {
            if(!this.state[side].id){
                return;
            }
            api.files.imgToBase64(`${config.apiAddress}api/teams/logo/${this.state[side].id}`).then(graphic => {
                if(!graphic){
                    return;
                }
                if(this.state.logos[side] !== graphic){
                    const { logos } = this.state;
                    logos[side] = graphic;
                    this.setState({logos});
                }
            });
        })
    }
    async componentDidMount() {
        await this.props.cxt.reload();
        const match = await api.match.get();
        const {state} = this;
        this.setState({...state, ...match});
        
    }
    render() {
        this.checkLogos();
        let leftTeam = "No team";
        let rightTeam = "No team";
        if(this.state.left.id) {
            const filtered = this.props.cxt.teams.filter(team => team._id === this.state.left.id)[0];
            if(filtered){
                leftTeam = filtered.name;
            } else {
                this.setState({...this.state, ...{left:{id: null, wins: 0}}});
            }
        }
        if(this.state.right.id) {
            const filtered = this.props.cxt.teams.filter(team => team._id === this.state.right.id)[0];
            if(filtered){
                rightTeam = filtered.name;
            } else {
                this.setState({...this.state, ...{right:{id: null, wins: 0}}});
            }
        }
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
                                <CardTitle>
                                    {this.state.logos.left ? <img src={`data:image/jpeg;base64,${this.state.logos.left}`} className='smallLogo' /> : ''}
                                    {leftTeam}
                                </CardTitle>
                                <CardSubtitle>Won {this.state.left.wins} maps</CardSubtitle>
                                <TeamModal
                                    button={<Button>SET</Button>}
                                    side='left'
                                    team={this.state.left}
                                    teams={this.props.cxt.teams}
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
                                <CardTitle>
                                    {this.state.logos.right ? <img src={`data:image/jpeg;base64,${this.state.logos.right}`} className='smallLogo' /> : ''}
                                    {rightTeam}
                                </CardTitle>
                                <CardSubtitle>Won {this.state.right.wins} maps</CardSubtitle>
                                <TeamModal
                                    button={<Button>SET</Button>}
                                    side='right'
                                    team={this.state.right}
                                    teams={this.props.cxt.teams}
                                    matchType={this.state.matchType}
                                    onSave={this.getData}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button color="primary" onClick={this.save}>Save</Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}
