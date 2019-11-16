import React from 'react';
import { IContextData } from './../../../../components/Context';
import api from './../../../../api/api';
import config from './../../../../api/config';
import * as I from './../../../../api/interfaces';
import { Row, Col, FormGroup, Label, Input, Form } from 'reactstrap';

export default class ActionPanel extends React.Component<{ cxt: IContextData, hud: I.HUD }, { form: any }> {
    constructor(props: { cxt: IContextData }) {
        super(props);
        this.state = {
            form: {}
        }
    }
    changeForm = (name: string ) => (e: any) => {
        /*const { form } = this.state;
        form[name] = !form[name];
        this.setState({ form });*/
    }
    componentDidMount() {
        const { hud }: { hud: I.HUD } = this.props;
        if(!hud.panel) return;
        const form: any = {};
        for(let section of hud.panel){
            form[section.label.toLowerCase()] = '';
        }
        this.setState({form});
    }
    startHUD(dir: string) {
        api.huds.start(dir);
    }
    render() {
        const { hud }: { hud: I.HUD } = this.props;
        if (!hud.panel) return '';
        return (
            <div>
                {hud.panel.map(section => <div key={section.label}>
                    <Form>
                        {section.inputs.map(input => <Row key={input.name}>
                            <Col s={12}>
                                <FormGroup>

                                    <FormGroup>
                                        <Label for={input.name.toLowerCase()}>{input.name}</Label>
                                        { input.type === "text" ?  <Input type="text" name={input.name.toLowerCase()} id={input.name.toLowerCase()} onChange={this.changeForm(input.name)} value={this.state.form[input.name] !== undefined ? this.state.form[input.name]: ''} />: ''  }
                                    </FormGroup>
                                </FormGroup>
                            </Col>
                        </Row>)}
                    </Form>
                </div>)}
            </div>
        )
    }
}
