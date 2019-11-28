import React from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col, CustomInput, FormText } from 'reactstrap';
import countryList from 'react-select-country-list';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { ContextData, IContextData } from './../../../../components/Context';
import DragFileInput from './../../../DragFileInput';


export default class Players extends React.Component<{ cxt: IContextData, data: any }, { options: any[], value: string, form: I.Player, forceLoad: boolean }> {
    emptyPlayer: I.Player;
    constructor(props: { cxt: IContextData, data: any }) {
        super(props);
        this.emptyPlayer = {
            _id: "empty",
            firstName: "",
            lastName: "",
            username: "",
            avatar: "",
            country: "",
            steamid: ""
        }
        this.state = {
            options: countryList().getData(),
            value: "",
            form: { ...this.emptyPlayer },
            forceLoad: false
        };
    }

    componentDidMount() {
        this.loadPlayers();
    }


    componentDidUpdate(pProps: any) {
        if (this.props.data && this.props.data.steamid && !this.state.forceLoad) {
            this.setState({ form: { ...this.emptyPlayer, steamid: this.props.data.steamid }, forceLoad: true }, () => {
                const player = this.props.cxt.players.filter(player => player.steamid === this.props.data.steamid)[0];
                if (player) this.loadPlayer(player._id)
            });
        } else if (!this.props.data && pProps.data && pProps.data.steamid === this.state.form.steamid) {
            this.setState({ form: { ...this.emptyPlayer, steamid: '' } }, this.clearAvatar)
        }
        if (!this.props.data && this.state.forceLoad) {
            this.setState({ forceLoad: false })
        }
    }

    loadPlayers = async (id?: string) => {
        await this.props.cxt.reload();
        if (id) {
            this.loadPlayer(id);
        }
    }

    loadPlayer = (id: string) => {
        const player = this.props.cxt.players.filter(player => player._id === id)[0];
        if (player) this.setState({ form: { ...player }}, this.clearAvatar);
    }

    loadEmpty = () => {
        this.setState({ form: { ...this.emptyPlayer } }, this.clearAvatar)
    }

    clearAvatar = () => { const avatarInput: any = document.getElementById("avatar"); avatarInput.value = ''; }

    setPlayer = (event: any) => {
        if (event.target.value === "empty") {
            //return this.setState({form:{...this.emptyPlayer}, filePath:''})
            return this.loadEmpty();
        }
        this.loadPlayer(event.target.value);
    }

    fileHandler = (files: FileList) => {
        

        if(!files || !files[0]) return;
        const file = files[0];
        const { form } = this.state;
        if (!file.type.startsWith("image")) {
            return;
        }
        let reader: any = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            form.avatar = reader.result.replace(/^data:([a-z]+)\/([a-z0-9]+);base64,/, '');
            this.setState({ form })
        }
    }


    changeHandler = (event: any) => {
        const name: 'steamid' | 'firstName' | 'lastName' | 'username' | 'avatar' | 'country' = event.target.name;
        const { form } = this.state;

        if (!event.target.files) {
            form[name] = event.target.value;
            return this.setState({ form });
        }

        return this.fileHandler(event.target.files);
    }

    save = async () => {
        const { form } = this.state;
        let response: any;
        if (form._id === "empty") {
            response = await api.players.add(form);
        } else {
            response = await api.players.update(form._id, form);
        }
        if (response && response._id) {
            this.loadPlayers(response._id);
        }
    }
    delete = async () => {
        if (this.state.form._id === "empty") return;
        const response = await api.players.delete(this.state.form._id);
        if (response) {
            await this.loadPlayers();
            return this.loadEmpty();
        }
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="players">Players</Label>
                    <Input type="select" name="players" id="players" onChange={this.setPlayer} value={this.state.form._id}>
                        <option value={"empty"}>New player</option>
                        {this.props.cxt.players.map(player => <option key={player._id} value={player._id}>{player.firstName} {player.username} {player.lastName}</option>)}
                    </Input>
                </FormGroup>
                <Row>
                    <Col md="4">
                        <FormGroup>
                            <Label for="first_name">First Name</Label>
                            <Input type="text" name="firstName" id="first_name" onChange={this.changeHandler} value={this.state.form.firstName} />
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
                            <Label for="last_name">Last Name</Label>
                            <Input type="text" name="lastName" id="last_name" onChange={this.changeHandler} value={this.state.form.lastName} />
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
                                <option value=''>None</option>
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

                    <Col md="6">
                        <FormGroup>
                            <Label>Avatar</Label>
                            <DragFileInput onChange={this.fileHandler} id="avatar" />
                            <FormText color="muted">
                                Avatar to be used for player images, instead of Steam's default
                            </FormText>
                            {/*<Label for="avatar">Avatar</Label>
                            <Input type="file" name="avatar" id="avatar" onChange={this.changeHandler} />
                            <FormText color="muted">
                                Avatar to be used for player images, instead of Steam's default
                            </FormText>*/}
                        </FormGroup>
                    </Col>
                    <Col md="6" className="centered">
                        {this.state.form.avatar.length ? <img src={'data:image/jpeg;base64,' + this.state.form.avatar} id="avatar_view" /> : ''}
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

