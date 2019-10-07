import React from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col, CustomInput } from 'reactstrap';
import countryList from 'react-select-country-list';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';

export default class Teams extends React.Component<{}, {options: any[], value: string, teams: I.Team[], form: I.Team}> {
    emptyTeam: I.Team;
    constructor(props: {}) {
        super(props);
        this.emptyTeam = {
            _id: "empty",
            name: "",
            shortName:"",
            country: "",
            logo: ""
        }

        this.state = {
            options: countryList().getData(),
            value: "",
            teams: [],
            form: {...this.emptyTeam}
        };
    }

    componentDidMount(){
        this.loadTeams();
    }

    loadTeams = async (id?: string) => {
        const teams = await api.teams.get();
        this.setState({teams});
        if(id){
            this.loadTeam(id);
        }
    }

    loadTeam = (id: string) => {
        const team = this.state.teams.filter(team => team._id === id)[0];
        if(team) this.setState({form:{...team}});
    }

    setTeam = (event: any) => {
        if(event.target.value === "empty") {
            return this.setState({form:{...this.emptyTeam}});
        }
        this.loadTeam(event.target.value);
    }

    changeHandler = (event: any) => {
        const name: 'name' | 'shortName' | 'logo' | 'country' = event.target.name;
        const { form } = this.state;
   
        form[name] = event.target.value;
        this.setState({form});
       // this.setState({ value })
    }

    save = async () => {
        const { form } = this.state;
        let response: any;
        if(form._id === "empty"){
            response = await api.teams.add(form);
        } else {
            response = await api.teams.update(form._id, form);
        }
        if(response && response._id){
            this.loadTeams(response._id);
        }
    }
    delete = async () => {
        if(this.state.form._id === "empty") return;
        const response = await api.teams.delete(this.state.form._id);
        if(response){
            await this.loadTeams();
            this.setState({form:{...this.emptyTeam}});
        }
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="teams">Teams</Label>
                    <Input type="select" name="teams" id="teams" onChange={this.setTeam} value={this.state.form._id}>
                        <option value={"empty"}>Empty team</option>
                        {this.state.teams.map(team  => <option key={team._id} value={team._id}>{team.name}</option>)}
                    </Input>
                </FormGroup>
                <Row>
                    <Col md="6">
                        <FormGroup>
                            <Label for="team_name">Team name</Label>
                            <Input type="text" name="name" id="team_name" value={this.state.form.name} onChange={this.changeHandler} />
                        </FormGroup>
                    </Col>
                    <Col md="6">
                        <FormGroup>
                            <Label for="short_name">Short name</Label>
                            <Input type="text" name="shortName" id="short_name" value={this.state.form.shortName || ''} onChange={this.changeHandler} />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="6">
                        <FormGroup>
                            <Label for="country">Country</Label>
                            <CustomInput
                                type="select"
                                id="country"
                                name="country"
                                value={this.state.form.country}
                                onChange={this.changeHandler}
                            >
                                {this.state.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </CustomInput>
                        </FormGroup>
                    </Col>
                    <Col md="6">
                        <FormGroup>
                            <Label for="team_logo">Logo</Label>
                            <Input type="file" name="team_logo" id="team_logo" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button color="primary" onClick={this.save}>Save</Button>
                        <Button color="primary" onClick={this.delete} disabled={this.state.form._id === "empty"}>Delete</Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}
