import React from 'react';
import { IContextData } from './../../../../components/Context';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { socket } from './../Live/Live';
import { Row, Col, FormGroup, Input, Form, Button } from 'reactstrap';
import FileInput from './../../../DragFileInput';

export default class ActionPanel extends React.Component<{ cxt: IContextData, hud: I.HUD }, { form: any }> {
    constructor(props: { cxt: IContextData, hud: I.HUD }) {
        super(props);
        this.state = {
            form: {}
        }
    }
    changeForm = (section: string, name: string) => (e: any) => {
        const { form } = this.state;
        if (!form[section]) form[section] = {};
        form[section][name] = e.target.value;
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
    getImageInputs = (panel: I.PanelTemplate) => {
        return this.filterInputs(panel, "image");
    }
    getActions = (panel: I.PanelTemplate) => {
        return this.filterInputs(panel, "action");
    }
    render() {
        const { hud }: { hud: I.HUD } = this.props;
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
                                        onChange={this.changeForm(section.name, input.name)}
                                        value={(form[section.name] && form[section.name][input.name]) || ''}
                                    />
                                </FormGroup>
                            </Col>)}
                        </Row>)}

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
                        {/*section.inputs.map(input => <Row key={input.name}>
                            <Col s={input.type === "text" ? 6 : 12}>
                                <FormGroup>

                                    <Label for={input.name.toLowerCase()}>{input.label}</Label>
                                    {input.type === "text" ?
                                        <Col md={6}>
                                            <Input type="text"
                                                name={input.name.toLowerCase()}
                                                id={input.name.toLowerCase()}
                                                onChange={this.changeForm(section.name, input.name)}
                                                value={(form[section.name] && form[section.name][input.name]) || ''}
                                            />
                                        </Col> : ''}
                                    {input.type === "action" ? <>
                                        {input.values.map(value => <Button onClick={() => this.sendAction({ action: input.name, data: value.name })}>{value.label}</Button>)}
                                    </> : ''}
                                    {input.type === "image" ? <Row>
                                        <Col md={12}>
                                            <FileInput image
                                                id={`file_${input.name}`}
                                                onChange={this.handleImages(input.name, section.name)}
                                                label={(input && input.label && input.label.toUpperCase()) || ''}
                                                imgSrc={form[section.name] && form[section.name][input.name]}
                                            />
                                        </Col>
                                    </Row> : ''}
                                </FormGroup>
                            </Col>
                        </Row>)*/}

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
