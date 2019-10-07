import React from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col, CustomInput } from 'reactstrap';
import countryList from 'react-select-country-list';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { ContextData, IContextData } from './../../../../components/Context';


export default class Players extends React.Component<{cxt: IContextData}, {options: any[], value: string, form: I.Player}> {
    emptyPlayer: I.Player;
    constructor(props: {cxt: IContextData}) {
        super(props);
        this.emptyPlayer = {
            _id: "empty",
            firstName: "",
            lastName:"",
            username:"",
            avatar: "",
            country: "",
            steamid: ""
        }
        this.state = {
            options: countryList().getData(),
            value: "",
            form: {...this.emptyPlayer},
        };
    }

    componentDidMount(){
        this.loadPlayers();
    }

    loadPlayers = async (id?: string) => {
        await this.props.cxt.reload();
        if(id){
            this.loadPlayer(id);
        }
    }

    loadPlayer = (id: string) => {
        const player = this.props.cxt.players.filter(player => player._id === id)[0];
        if(player) this.setState({form:{...player}});
    }

    setPlayer = (event: any) => {
        if(event.target.value === "empty") {
            return this.setState({form:{...this.emptyPlayer}})
        }
        this.loadPlayer(event.target.value);
    }


    changeHandler = (event: any) => {
        const name: 'steamid' | 'firstName' | 'lastName' | 'username' | 'avatar' | 'country' = event.target.name;
        const { form } = this.state;
        form[name] = event.target.value;
        this.setState({form});
       // this.setState({ value })
    }

    save = async () => {
        const { form } = this.state;
        let response: any;
        if(form._id === "empty"){
            response = await api.players.add(form);
        } else {
            response = await api.players.update(form._id, form);
        }
        if(response && response._id){
            this.loadPlayers(response._id);
        }
    }
    delete = async () => {
        if(this.state.form._id === "empty") return;
        const response = await api.players.delete(this.state.form._id);
        if(response){
            await this.loadPlayers();
            this.setState({form:{...this.emptyPlayer}});
        }
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="players">Players already exists</Label>
                    <Input type="select" name="players" id="players" onChange={this.setPlayer}>
                        <option value={"empty"}>Empty team</option>
                        {this.props.cxt.players.map(player => <option key={player._id} value={player._id}>{player.firstName} {player.username} {player.lastName}</option>)}
                    </Input>
                </FormGroup>
                <Row>
                    <Col md="4">
                        <FormGroup>
                            <Label for="first_name">First name</Label>
                            <Input type="text" name="firstName" id="first_name" onChange={this.changeHandler} value={this.state.form.firstName}/>
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label for="nick">Nick</Label>
                            <Input type="text" name="username" id="nick" onChange={this.changeHandler} value={this.state.form.username} />
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label for="last_name">Last name</Label>
                            <Input type="text" name="lastName" id="last_name" onChange={this.changeHandler} value={this.state.form.lastName}/>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="6">
                        <FormGroup>
                            <Label for="player_flag">Country</Label>
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
                            <Label for="steamid">SteamID 64</Label>
                            <Input id="steamid" type="text" name="steamid" value={this.state.form.steamid} onChange={this.changeHandler} />
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

