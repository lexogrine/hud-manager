import React from 'react';
import { Form, FormGroup, Input, Row, Col, Toast, ToastBody, ToastHeader, Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import api from './../../../../api/api';

interface ConfigStatus extends I.CFGGSIResponse {
    loading: boolean
}

export default class Config extends React.Component<any, { config: I.Config, cfg: ConfigStatus, gsi: ConfigStatus, restartRequired: boolean }>  {
    constructor(props: any) {
        super(props);
        this.state = {
            config: {
                steamApiKey: '',
                port: 1337,
                token: ''
            },
            cfg: {
                success: false,
                loading: true,
                message: 'Loading data about cfg files...',
                accessible: true
            },
            gsi: {
                success: false,
                loading: true,
                message: 'Loading data about GameState files...',
                accessible: true
            },
            restartRequired: false
        }
    }
    download = (target: 'gsi' | 'cfgs') => {
        api.config.download(target);
    }
    getConfig = async () => {
        const config = await api.config.get();
        this.setState({ config });
    }
    createGSI = async () => {
        const { gsi } = this.state;
        gsi.message = 'Loading data about GameState files...';

        this.setState({ gsi });
        await api.gamestate.create();
        this.checkGSI();
    }
    createCFG = async () => {
        const { cfg } = this.state;
        cfg.message = 'Loading data about GameState files...';

        this.setState({ cfg });
        await api.cfgs.create();
        this.checkCFG();
    }
    checkGSI = async () => {
        const { gsi } = this.state;
        gsi.message = 'Loading data about GameState files...';

        this.setState({ gsi });

        const response = await api.gamestate.check();

        if (response.success === false) {
            return this.setState({ gsi: { success: false, message: response.message, loading: false, accessible: response.accessible } });
        }
        return this.setState({ gsi: { success: true, loading: false, accessible: true } });
    }
    checkCFG = async () => {
        const { cfg } = this.state;
        cfg.message = 'Loading data about cfg files...';

        this.setState({ cfg });

        const response = await api.cfgs.check();

        if (response.success === false) {
            return this.setState({ cfg: { success: false, message: response.message, loading: false, accessible: response.accessible } });
        }
        return this.setState({ cfg: { success: true, loading: false, accessible: true } });
    }

    async componentDidMount() {
        this.getConfig();
        this.checkCFG();
        this.checkGSI();
    }

    changeHandler = (event: any) => {
        const name: 'steamApiKey' | 'port' | 'token' = event.target.name;
        const { config }: any = this.state;
        config[name] = event.target.value;
        this.setState({ config });
        // this.setState({ value })
    }
    save = async () => {
        const { config } = this.state;
        const oldConfig = await api.config.get();
        if (oldConfig.port !== config.port) {
            this.setState({ restartRequired: true });
        }
        await api.config.update(config);
        this.checkGSI();
    }
    render() {
        const { gsi, cfg } = this.state;
        return (
            <Form>
                <div className="tab-title-container">Settings</div>
                <div className="tab-content-container no-padding">
                    <Row className="padded base-config">
                        <Col md="4">
                            <FormGroup>
                                {/*<Label for="steamApiKey"><Tip id="steamapikey_tooltip" label="Steam API Key" link='https://steamcommunity.com/dev/apikey'>It's neccessary to load Steam avatars, you can get yours on https://steamcommunity.com/dev/apikey</Tip></Label>*/}
                                <Input type="text" name="steamApiKey" id="steamApiKey" onChange={this.changeHandler} value={this.state.config.steamApiKey} placeholder="Steam API Key" />
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                {/*<Label for="port"><Tip id="gsiport_tooltip" label="CSGO GSI Port">Use values between 1000 and 9999 - after saving changes also restart the manager</Tip></Label>*/}
                                <Input type="number" name="port" id="port" onChange={this.changeHandler} value={this.state.config.port} placeholder="CSGO GSI Port"/>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                {/*<Label for="token"><Tip id="gsitoken_tooltip" label="CSGO GSI Token">Token to identify your game - you can leave it empty</Tip></Label>*/}
                                <Input type="text" name="token" id="token" onChange={this.changeHandler} value={this.state.config.token} placeholder="CSGO GSI Token"/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="config-container">
                        <Col md="12" className="config-entry">
                            <div className="config-description">
                                GameState Integration: {gsi.message || 'Loaded succesfully'}
                            </div>
                            <Button className="purple-btn round-btn" disabled={gsi.loading || gsi.success || !gsi.accessible} onClick={this.createGSI}>Add GSI file</Button>
                        </Col>
                        <Col md="12" className="config-entry">
                            <div className="config-description">
                                Configs: {cfg.message || 'Loaded succesfully'}
                            </div>
                            <Button className="purple-btn round-btn" disabled={cfg.loading || cfg.success || !cfg.accessible} onClick={this.createCFG}>Add config files</Button>
                        </Col>
                        <Col md="12" className="config-entry">
                            <div className="config-description">
                                Credits
                            </div>
                            <Button className="lightblue-btn round-btn" onClick={() => this.props.toggle('credits')}>See now</Button>
                        </Col>
                    </Row>
                    <Button onClick={() => this.download('gsi')}>Download GSI config</Button>
                    <Button onClick={() => this.download('cfgs')}>Download HUD configs</Button>
                    <Toast isOpen={this.state.restartRequired} className="fixed-toast">
                        <ToastHeader>Change of port detected</ToastHeader>
                        <ToastBody>It seems like you've changed GSI port - for all changes to be set in place you should now restart the Manager and update the GSI files</ToastBody>
                    </Toast>
                </div>
                <Row>
                    <Col className="main-buttons-container">
                        <Button onClick={this.save} color="primary">Save</Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}
