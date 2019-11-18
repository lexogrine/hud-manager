import React from 'react';
import { IContextData } from './../../../../components/Context';
import api from './../../../../api/api';
import config from './../../../../api/config';
import * as I from './../../../../api/interfaces';
import { socket } from './../Live/Live';
import { Row, Col, FormGroup, Label, Input, Form, Button } from 'reactstrap';

const upperFirst = (str: string) => str.charAt(0).toUpperCase() + str.substr(1);

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
        console.log(form);
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
    }

    sendSection(name: string) {
        const section = this.state.form[name];
        socket.emit('hud_config', { hud: this.props.hud.dir, config: section })
    }

    sendAction = (action: any) => {
        socket.emit('hud_action', { hud: this.props.hud.dir, action });
    }
    startHUD(dir: string) {
        api.huds.start(dir);
    }
    render() {
        const { hud }: { hud: I.HUD } = this.props;
        if (!hud.panel) return '';
        const { form } = this.state;
        return (
            <div>
                {hud.panel.map(section => <div key={section.label}>
                    <Form>
                        {section.inputs.map(input => <Row key={input.name}>
                            <Col s={12}>
                                <FormGroup>

                                    <FormGroup>
                                        <Label for={input.name.toLowerCase()}>{input.label}</Label>
                                        {input.type === "text" ? <Input type="text" name={input.name.toLowerCase()} id={input.name.toLowerCase()} onChange={this.changeForm(section.name, input.name)} value={form[section.name] && form[section.name][input.name] || ''} /> : ''}
                                        {input.type === "action" ? <>
                                            {input.values.map(value => <Button onClick={() => this.sendAction({ action: input.name, data: value.name })}>{value.label}</Button>)}
                                        </> : ''}
                                    </FormGroup>
                                </FormGroup>
                            </Col>
                        </Row>)}
                        <Col s={12}>
                            <Button onClick={() => this.sendSection(section.name)}>Save and send</Button>
                        </Col>
                    </Form>
                </div>)}
            </div>
        )
    }
}
