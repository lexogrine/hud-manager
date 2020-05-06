import React from 'react';
import { IContextData } from './../../../../components/Context';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Row, Col, Button } from 'reactstrap';
import Panel from './Panel';
import { socket } from '../Live/Live';
import Switch from './../../../../components/Switch/Switch';
import DragInput from './../../../DragFileInput';
import HudEntry from './HudEntry';
import goBack from "./../../../../styles/goBack.png";
import config from './../../../../api/config';
const isElectron = config.isElectron;

interface CFG {
    cfg: string,
    file: string
}
function createCFG(customRadar: boolean, customKillfeed: boolean): CFG {
    let cfg = `cl_draw_only_deathnotices 1`;
    let file = 'hud';

    if (!customRadar) {
        cfg += `\ncl_drawhud_force_radar 1`;
    } else {
        file += '_radar';
    }
    if (customKillfeed) {
        file += '_killfeed';
        cfg += `\ncl_drawhud_force_deathnotices -1`;
    }
    return { cfg, file };
}

export default class Huds extends React.Component<{ cxt: IContextData }, { config: I.Config, huds: I.HUD[], form: { killfeed: boolean, radar: boolean }, active: I.HUD | null }> {
    constructor(props: { cxt: IContextData }) {
        super(props);
        this.state = {
            huds: [],
            config: {
                steamApiKey: '',
                hlaePath: '',
                port: 1349,
                token: ''
            },
            form: {
                killfeed: false,
                radar: false
            },
            active: null
        }
    }

    runCSGO = () => {
        const config = createCFG(this.state.form.radar, this.state.form.killfeed).file;
        api.csgo.run(config);
    }
    runCSGOExperimental = () => {
        api.csgo.runExperimental();
    }

    handleZIPs = (files: FileList) => {
        const file = files[0];
        let reader: any = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if(file.name.substr(-4) === '.rar'){
                return;
            }
            //form[sectionName][name] = reader.result.replace(/^data:([a-z]+)\/([a-z0-9]+);base64,/, '');
            //this.setState({ form }, () => console.log(this.state.form))
            //console.log(reader.result)
            api.huds.upload(reader.result);
        }
    }
    changeForm = (name: 'killfeed' | 'radar') => (e: any) => {
        const { form } = this.state;
        form[name] = !form[name];
        this.setState({ form });
    }
    getConfig = async () => {
        const config = await api.config.get();
        this.setState({ config });
    }
    loadHUDs = async () => {
        const huds = await api.huds.get();
        this.setState({ huds });
    }
    async componentDidMount() {
        socket.on('reloadHUDs', this.loadHUDs)
        this.loadHUDs();
        this.getConfig();
    }
    startHUD(dir: string) {
        api.huds.start(dir);
    }
    toggleConfig = (hud?: I.HUD) => () => {
        this.setState({ active: hud || null });
    }
    render() {
        const { killfeed, radar } = this.state.form;
        const { active, config } = this.state
        if (active) {
            return <React.Fragment>
                <div className="tab-title-container">
                    <img src={goBack} onClick={this.toggleConfig()} className="go-back-button" alt="Go back"/>
                    HUD Settings
                </div>
                <div className="tab-content-container full-scroll">
                    <Panel hud={active} cxt={this.props.cxt} />
                </div>
            </React.Fragment>
        }
        return (
            <React.Fragment>
                <div className="tab-title-container">HUDS</div>
                <div className={`tab-content-container no-padding ${!isElectron ? 'full-scroll':''}`}>
                    <Row className="config-container">
                        <Col md="12" className="config-entry">
                            <div className="config-description">
                                Use Boltgolt's radar
                            </div>
                            <Switch isOn={this.state.form.radar} id="radar-toggle" handleToggle={this.changeForm('radar')} />
                        </Col>
                        <Col md="12" className="config-entry">
                            <div className="config-description">
                                Use custom killfeed
                            </div>
                            <Switch isOn={this.state.form.killfeed} id="killfeed-toggle" handleToggle={this.changeForm('killfeed')} />
                        </Col>
                        <Col md="12" className="config-entry">
                            <div className="running-csgo-container">
                                <div>
                                    <div className="config-description">
                                        Type in CS:GO console:
                                    </div>
                                    <code className="exec-code">exec {createCFG(radar, killfeed).file}</code>
                                    {isElectron ? <React.Fragment>
                                        <div className="config-description">
                                            OR
                                         </div>
                                        <Button className="round-btn run-csgo" disabled={killfeed && !config.hlaePath} onClick={this.runCSGO}>RUN CSGO</Button>
                                        <Button className="round-btn run-csgo" disabled={killfeed && !config.hlaePath} onClick={this.runCSGOExperimental}>RUN EXPERIMENTAL</Button>
                                    </React.Fragment> : ''}
                                </div>
                                <div className="warning">
                                        {killfeed && !config.hlaePath && isElectron ? 'Specify HLAE path in settings in order to use custom killfeed functionality' : ''}
                                </div>
                            </div>

                        </Col>
                    </Row>

                    <Row className="padded">
                        <Col>
                            <Col s={12}>
                                <DragInput id={`hud_zip`} onChange={this.handleZIPs} label="UPLOAD HUD" accept=".zip" />
                            </Col>
                            {this.state.huds.map(hud => <HudEntry key={hud.dir} hud={hud} toggleConfig={this.toggleConfig}/>)}
                        </Col>
                    </Row>

                    {isElectron ? <Row>
                        <Col className="main-buttons-container">
                            <Button onClick={api.huds.openDirectory} color="primary">Open HUDs directory</Button>
                        </Col>
                    </Row> : ''}
                </div>
            </React.Fragment>
        )
    }
}
