import React from 'react';
import { IContextData } from './../../../../components/Context';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Row, Col, Button } from 'reactstrap';
import Panel from './Panel';
import { socket } from '../Live/Live';
import Switch from './../../../../components/Switch/Switch';
import ElectronOnly from './../../../../components/ElectronOnly';
import DragInput from './../../../DragFileInput';
import HudEntry from './HudEntry';
import goBack from "./../../../../styles/goBack.png";
import config from './../../../../api/config';
const isElectron = config.isElectron;

interface CFG {
    cfg: string,
    file: string
}
function createCFG(customRadar: boolean, customKillfeed: boolean, afx: boolean, autoexec = true): CFG {
    let cfg = `cl_draw_only_deathnotices 1`;
    let file = 'hud';

    if (!customRadar) {
        cfg += `\ncl_drawhud_force_radar 1`;
    } else {
        cfg += `\ncl_drawhud_force_radar 0`;
        file += '_radar';
    }
    if (customKillfeed) {
        file += '_killfeed';
        cfg += `\ncl_drawhud_force_deathnotices -1`;
        cfg += `\nmirv_pgl url "ws://localhost:31337/mirv"`;
        cfg += `\nmirv_pgl start`;
    }
    if(afx){
        file += '_interop';
        cfg = 'afx_interop connect 1';
        cfg += `exec ${createCFG(customRadar, customKillfeed, false)}`;
        
    }
    if(!autoexec){
        file = '';
    }
    file += '.cfg';
    return { cfg, file };
}

interface IProps {
    cxt: IContextData
}

interface IForm {
    killfeed: boolean,
    radar: boolean,
    afx: boolean,
    autoexec: boolean,
}

interface IState {
    config: I.Config,
    huds: I.HUD[],
    form: IForm,
    active: I.HUD | null,
    currentHUD: string | null
}

export default class Huds extends React.Component<IProps, IState> {
    constructor(props: { cxt: IContextData }) {
        super(props);
        this.state = {
            huds: [],
            config: {
                steamApiKey: '',
                hlaePath: '',
                port: 1349,
                token: '',
                afxCEFHudInteropPath: ''
            },
            form: {
                killfeed: false,
                radar: false,
                afx: false,
                autoexec: true
            },
            active: null,
            currentHUD: null
        }
    }

    runGame = (afx: boolean) => () => {
        const config = createCFG(this.state.form.radar, this.state.form.killfeed, this.state.form.afx).file;
        if(afx){
            return api.game.runExperimental(config);
        }
        return api.game.run(config);
    }

    handleZIPs = (files: FileList) => {
        const file = files[0];
        let reader: any = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const name = file.name.substr(0, file.name.lastIndexOf('.')).replace(/\W/g, '');
            if (file.name.substr(-4) === '.rar' || !name) {
                return;
            }
            //form[sectionName][name] = reader.result.replace(/^data:([a-z]+)\/([a-z0-9]+);base64,/, '');
            //this.setState({ form }, () => console.log(this.state.form))
            //console.log(reader.result)
            api.huds.upload(reader.result, name);
        }
    }
    changeForm = (name: keyof IForm) => (e: any) => {
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
        socket.on('reloadHUDs', this.loadHUDs);
        socket.on('active_hlae', (hud: string | null) => {
            this.setState({ currentHUD: hud });
        });
        socket.emit("get_active_hlae");
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
        const { killfeed, radar, afx } = this.state.form;
        const { active, config } = this.state
        if (active) {
            return <React.Fragment>
                <div className="tab-title-container">
                    <img src={goBack} onClick={this.toggleConfig()} className="go-back-button" alt="Go back" />
                    HUD Settings
                </div>
                <div className="tab-content-container full-scroll">
                    <Panel hud={active} cxt={this.props.cxt} />
                </div>
            </React.Fragment>
        }
        return (
            <React.Fragment>
                <div className="tab-title-container">HUDs</div>
                <div className={`tab-content-container no-padding ${!isElectron ? 'full-scroll' : ''}`}>
                    <Row className="config-container">
                        <Col md="12" className="config-entry">
                            <div className="config-description">
                                Use custom radar
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
                            <div className="config-description">
                                Use built-in HUD (Experimental mode, uses AFX Interop)
                            </div>
                            <Switch isOn={this.state.form.afx} id="afx-toggle" handleToggle={this.changeForm('afx')} />
                        </Col>
                        <Col md="12" className="config-entry">
                            <div className="config-description">
                                Auto-execute
                            </div>
                            <Switch isOn={this.state.form.autoexec} id="autoexec-toggle" handleToggle={this.changeForm('autoexec')} />
                        </Col>
                        <Col md="12" className="config-entry">
                            <div className="running-game-container">
                                <div>
                                    <div className="config-description">
                                        Console:
                                    </div>
                                    <code className="exec-code">exec {createCFG(radar, killfeed, afx).file}</code>
                                    <ElectronOnly>
                                        <div className="config-description">
                                            OR
                                         </div>
                                        <Button className="round-btn run-game" disabled={(killfeed && !config.hlaePath) || (afx && (!config.hlaePath || !config.afxCEFHudInteropPath))} onClick={this.runGame(afx)}>RUN GAME</Button>
                                    </ElectronOnly>
                                </div>
                                <div className="warning">
                                    <ElectronOnly>
                                        {(killfeed || afx) && !config.hlaePath ? <div>Specify HLAE path in Settings in order to use custom killfeeds</div> : null}
                                        {afx && !config.afxCEFHudInteropPath ? <div>Specify AFX Interop path in Settings in order to use AFX mode</div> : null}
                                        {afx && config.afxCEFHudInteropPath && config.hlaePath ? <div>When using AFX mode, after joining the match click on the SET button - no need to start the overlay.</div>: null}
                                    </ElectronOnly>
                                </div>
                            </div>

                        </Col>
                    </Row>

                    <Row className="padded">
                        <Col>
                            <Col s={12}>
                                <DragInput id={`hud_zip`} onChange={this.handleZIPs} label="ADD HUD" accept=".zip" />
                            </Col>
                            {this.state.huds.map(hud => <HudEntry key={hud.dir} hud={hud} toggleConfig={this.toggleConfig} isActive={hud.url === this.state.currentHUD} />)}
                        </Col>
                    </Row>

                    {isElectron ? <Row>
                        <Col className="main-buttons-container">
                            <Button onClick={api.huds.openDirectory} color="primary">Open HUD directory</Button>
                        </Col>
                    </Row> : ''}
                </div>
            </React.Fragment>
        )
    }
}
