import React from 'react';
import { Form, FormGroup, Label, Input, Row, Col, Toast, ToastBody, ToastHeader, Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import api from './../../../../api/api';
import Tip from './../../../Tooltip';

interface ConfigStatus extends I.CFGGSIResponse {
    loading: boolean
}

export default class Huds extends React.Component<any, {config: I.Config, cfg: ConfigStatus, gsi: ConfigStatus, restartRequired: boolean}>  {
    constructor(props: any){
        super(props);
        this.state = {
            config: {
                steamApiKey:'',
                port:1337,
                token:''
            },
            cfg: {
                success: false,
                loading: true,
                message: 'Loading data about cfg files...'
            },
            gsi: {
                success: false,
                loading: true,
                message: 'Loading data about GameState files...'
            },
            restartRequired: false
        }
    }
    getConfig = async () => {
        const config = await api.config.get();
        this.setState({config});
    }
    createGSI = async () => {
        const { gsi }= this.state;
        gsi.message = 'Loading data about GameState files...';

        this.setState({gsi});
        await api.gamestate.create();
        this.checkGSI();
    }
    createCFG = async () => {
        const { cfg }= this.state;
        cfg.message = 'Loading data about GameState files...';

        this.setState({cfg});
        await api.cfgs.create();
        this.checkCFG();
    }
    checkGSI = async () => {
        const { gsi }= this.state;
        gsi.message = 'Loading data about GameState files...';

        this.setState({gsi});

        const response = await api.gamestate.check();
        
        if(response.success === false){
            return this.setState({gsi:{success:false, message: response.message, loading: false}});
        }
        return this.setState({gsi:{success:true, loading: false}});
    }
    checkCFG = async  () => {
        const { cfg }= this.state;
        cfg.message = 'Loading data about cfg files...';
        
        this.setState({cfg});

        const response = await api.cfgs.check();

        if(response.success === false){
            return this.setState({cfg:{success:false, message: response.message, loading: false}});
        }
        return this.setState({cfg:{success:true, loading: false}});
    }

    async componentDidMount(){
        this.getConfig();
        this.checkCFG();
        this.checkGSI();
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
        const oldConfig = await api.config.get();
        if(oldConfig.port !== config.port){
            this.setState({restartRequired: true});
        }
        await api.config.update(config);
        this.checkGSI();
    }
    render() {
        const { gsi, cfg } = this.state;
        return (
            <Form>
                <Row>
                    <Col md="4">
                        <FormGroup>
                            <Label for="steamApiKey"><Tip label="Steam API Key">It's neccessary to load Steam avatars, you can get yours on https://steamcommunity.com/dev/apikey</Tip></Label>
                            <Input type="text" name="steamApiKey" id="steamApiKey" onChange={this.changeHandler} value={this.state.config.steamApiKey}/>
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label for="port"><Tip label="CSGO GSI Port">Use values between 1000 and 9999 - after saving changes also restart the manager</Tip></Label>
                            <Input type="number" name="port" id="port" onChange={this.changeHandler} value={this.state.config.port} />
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label for="token"><Tip label="CSGO GSI Token">Token to identify your game - you can leave it empty</Tip></Label>
                            <Input type="text" name="token" id="token" onChange={this.changeHandler} value={this.state.config.token}/>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="12" className="config-container">
                        GameState Integration:
                        
                        <span>
                        &nbsp;{`${gsi.message || 'Loaded succesfully'}`}
                        </span>
                        <Button color="primary" disabled={gsi.loading || gsi.success} onClick={this.createGSI}>Add GSI file</Button>
                    </Col>
                </Row>
                <Row>
                    <Col md="12" className="config-container">
                        Configs:
                        <span>
                        &nbsp;{`${cfg.message || 'Loaded succesfully'}`}
                        </span>
                        <Button color="primary" disabled={cfg.loading || cfg.success} onClick={this.createCFG}>Add config files</Button>
                        
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Button color="primary" onClick={this.save}>Save</Button>
                    </Col>
                </Row>
                <Toast isOpen={this.state.restartRequired} className="fixed-toast">
                    <ToastHeader>Change of port detected</ToastHeader>
                    <ToastBody>It seems like you've changed GSI port - for all changes to be set in place you should now restart the Manager and update the GSI files</ToastBody>
                </Toast>
            </Form>
        )
    }
}
