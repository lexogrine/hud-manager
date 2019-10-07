import React from 'react';
import { Form, FormGroup, Label, Input, Row, Col, CustomInput, Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import api from './../../../../api/api';

export default class Huds extends React.Component<any, {config: I.Config}>  {
    constructor(props: any){
        super(props);
        this.state = {
            config: {
                steamApiKey:'',
                port:1337,
                token:''
            }
        }
    }
    async componentDidMount(){
        const config = await api.config.get();
        this.setState({config})
    }

    changeHandler = (event: any) => {
        const name: 'steamApiKey' | 'port' | 'token' = event.target.name;
        const { config }: any = this.state;
        config[name] = event.target.value;
        this.setState({config});
       // this.setState({ value })
    }
    save = async () => {
        const { config } = this.state;
        const response = await api.config.update(config);
    }
    render() {
        return (
            <Form>
                <Row>
                    <Col md="4">
                        <FormGroup>
                            <Label for="steamApiKey">Steam API Key</Label>
                            <Input type="text" name="steamApiKey" id="steamApiKey" onChange={this.changeHandler} value={this.state.config.steamApiKey}/>
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label for="port">Port</Label>
                            <Input type="number" name="port" id="port" onChange={this.changeHandler} value={this.state.config.port} />
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label for="token">Token</Label>
                            <Input type="text" name="token" id="token" onChange={this.changeHandler} value={this.state.config.token}/>
                        </FormGroup>
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
