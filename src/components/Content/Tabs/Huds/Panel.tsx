import React from 'react';
import { IContextData } from './../../../../components/Context';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { socket } from './../Live/Live';
import { Row, Col, FormGroup, Input, Form, Button, Label } from 'reactstrap';
import FileInput from './../../../DragFileInput';

interface IProps {
    cxt: IContextData,
    hud: I.HUD
}
interface IState {
    form: any
}
export default class ActionPanel extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            form: {}
        }
    }
    changeForm = (section: string, name: string, type: I.PanelInputType) => (e: any) => {
        const { form } = this.state;
        if (!form[section]) form[section] = {};
        switch(type){
            case "player":
            case "team":
            case "match":
                form[section][name] = { type, id: e.target.value };
                break;
            case "checkbox":
                form[section][name] = e.target.checked;
                break;
            default:
                form[section][name] = e.target.value;
                break;
        }
        this.setState({ form });
    }
    componentDidMount() {
        const { hud }: { hud: I.HUD } = this.props;
        if (!hud.panel) return;
        const form: any = {};
        for (let section of hud.panel) {

            form[section.name] = {};
            for (let input of section.inputs) {
                if (input.type !== 'action') form[section.name][input.name] = '';
                if(input.type === "player" || input.type === "team" || input.type === "match") form[section.name][input.name] = {};
                if(input.type === "checkbox") form[section.name][input.name] = false;
            }
        }
        this.setState({ form });
        socket.on('hud_config', (data: any) => {
            if (!data) return;
            const form = data;
            this.setState({ form });
        });

        socket.emit('get_config', hud.dir);
    }

    handleImages = (name: string, sectionName: string) => (files: FileList) => {
        if (!files || !files[0]) return;
        const file = files[0];
        const { form } = this.state;
        if (!file.type.startsWith("image")) {
            return;
        }
        let reader: any = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            form[sectionName][name] = reader.result.replace(/^data:([a-z]+)\/([a-z0-9]+);base64,/, '');
            this.setState({ form })
        }
    }

    sendSection(name: string) {
        const section = this.state.form[name];
        socket.emit('hud_config', { hud: this.props.hud.dir, section: name, config: section })
    }

    sendAction = (action: any) => {
        socket.emit('hud_action', { hud: this.props.hud.dir, action });
    }
    startHUD(dir: string) {
        api.huds.start(dir);
    }
    filterInputs = (panel: I.PanelTemplate, type: I.PanelInputType | "action") => {
        return panel.inputs.filter(input => input.type === type);
    }
    getTextInputs = (panel: I.PanelTemplate) => {
        const layout: I.PanelInput[][] = [];
        const texts = this.filterInputs(panel, "text");
        texts.map((input, ind) => {
            const i = Math.floor(ind / 2);
            if (!layout[i]) {
                layout[i] = [];
            }
            layout[i].push(input);
            return input;
        });

        return layout;
    }
    getImageInputs = (panel: I.PanelTemplate) => this.filterInputs(panel, "image");

    getTeamSelect = (panel: I.PanelTemplate) => this.filterInputs(panel, "team");

    getMatchSelect = (panel: I.PanelTemplate) => this.filterInputs(panel, "match");

    getPlayerSelect = (panel: I.PanelTemplate) => this.filterInputs(panel, "player");

    getActions = (panel: I.PanelTemplate) => this.filterInputs(panel, "action");

    getSelects = (panel: I.PanelTemplate) => this.filterInputs(panel, "select");

    getCheckboxes = (panel: I.PanelTemplate) => this.filterInputs(panel, "checkbox");

    render() {
        const { hud, cxt } = this.props;
        const { teams, matches, players } = cxt;
        if (!hud.panel) return '';
        const { form } = this.state;
        return (
            <div>
                {hud.panel.map(section => <div key={section.label} className="custom_form">
                    <div className="section_name">{section.label}</div>
                    <Form>
                        {this.getTextInputs(section).map(inputs => <Row>
                            {inputs.map(input => <Col s={6} key={input.name}>
                                <FormGroup>
                                    <Input type="text"
                                        placeholder={input.label}
                                        name={input.name.toLowerCase()}
                                        id={input.name.toLowerCase()}
                                        onChange={this.changeForm(section.name, input.name, input.type)}
                                        value={(form[section.name] && form[section.name][input.name]) || ''}
                                    />
                                </FormGroup>
                            </Col>)}
                        </Row>)}
                        {this.getTeamSelect(section).map(input => <Row key={input.name}>
                            <Col s={12}>
                                <FormGroup>
                                    <Label for={input.name.toLowerCase()}>{input.label}</Label>
                                    <Input
                                        type="select"
                                        id={input.name.toLowerCase()}
                                        name={input.name.toLowerCase()}
                                        value={(form[section.name] && form[section.name][input.name] && form[section.name][input.name].id) || ''}
                                        onChange={this.changeForm(section.name, input.name, input.type)}
                                    >
                                        <option value="">No team</option>
                                        {teams.map(team => <option value={team._id}>{team.name}</option>)}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        )}
                        {this.getPlayerSelect(section).map(input => <Row key={input.name}>
                            <Col s={12}>
                                <FormGroup>
                                    <Label for={input.name.toLowerCase()}>{input.label}</Label>
                                    <Input
                                        type="select"
                                        id={input.name.toLowerCase()}
                                        name={input.name.toLowerCase()}
                                        value={(form[section.name] && form[section.name][input.name] && form[section.name][input.name].id) || ''}
                                        onChange={this.changeForm(section.name, input.name, input.type)}
                                    >
                                        <option value="">No player</option>
                                        {players.map(player => <option value={player._id}>{player.username}</option>)}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        )}
                        {this.getMatchSelect(section).map(input => <Row key={input.name}>
                            <Col s={12}>
                                <FormGroup>
                                    <Label for={input.name.toLowerCase()}>{input.label}</Label>
                                    <Input
                                        type="select"
                                        id={input.name.toLowerCase()}
                                        name={input.name.toLowerCase()}
                                        value={(form[section.name] && form[section.name][input.name] && form[section.name][input.name].id) || ''}
                                        onChange={this.changeForm(section.name, input.name, input.type)}
                                    >
                                        <option value="">No match</option>
                                        {matches.map(match => <option value={match.id}>
                                            {(teams.find(team => team._id === match.left.id) || {}).name || '-'} vs {(teams.find(team => team._id === match.right.id) || {}).name || '-'}
                                        </option>)}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        )}
                        {this.getSelects(section).map(input => input.type === "select" ? <Row key={input.name}>
                            <Col s={12}>
                                <FormGroup>
                                    <Label for={input.name.toLowerCase()}>{input.label}</Label>
                                    <Input
                                        type="select"
                                        id={input.name.toLowerCase()}
                                        name={input.name.toLowerCase()}
                                        value={(form[section.name] && form[section.name][input.name]) || ''}
                                        onChange={this.changeForm(section.name, input.name, input.type)}
                                    >
                                        <option value="">No value</option>
                                        {input.values.map(value => <option value={value.name}>{value.label}</option>)}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row> : null
                        )}
                        {this.getCheckboxes(section).map(input => input.type === "checkbox" ? <Row key={input.name}>
                            <Col s={12}>
                                <FormGroup check>
                                    <Input
                                        type="checkbox"
                                        id={input.name.toLowerCase()}
                                        name={input.name.toLowerCase()}
                                        checked={Boolean(form[section.name] && form[section.name][input.name])}
                                        onChange={this.changeForm(section.name, input.name, input.type)}
                                    />
                                    <Label for={input.name.toLowerCase()} check>{input.label}</Label>
                                </FormGroup>
                            </Col>
                        </Row> : null
                        )}
                        {this.getImageInputs(section).map(input => <Row>
                            <Col s={12}>
                                <FileInput image
                                    id={`file_${input.name}`}
                                    onChange={this.handleImages(input.name, section.name)}
                                    label={(input && input.label && input.label.toUpperCase()) || ''}
                                    imgSrc={form[section.name] && form[section.name][input.name]}
                                />
                            </Col>
                        </Row>
                        )}
                        <Row>
                            {this.getActions(section).map(input => <Col s={12} key={input.name} className="action_containers">
                                {input.type === "action" ?
                                    input.values.map(value =>
                                        <Button key={value.name} className="round-btn" onClick={() => this.sendAction({ action: input.name, data: value.name })}>
                                            {value.label}
                                        </Button>)
                                    : ""}
                            </Col>)}
                        </Row>

                        <Row className="section-save">
                            <Col s={12}>
                                <Button onClick={() => this.sendSection(section.name)} className="round-btn purple-btn">Save and send</Button>
                            </Col>
                        </Row>
                    </Form>
                </div>)}
            </div>
        )
    }
}
