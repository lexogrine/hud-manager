import React from 'react';
import { IContextData } from './../../../../components/Context';
import api from './../../../../api/api';
import config from './../../../../api/config';
import * as I from './../../../../api/interfaces';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';

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
export default class Huds extends React.Component<{ cxt: IContextData }, { huds: I.HUD[], form: {killfeed: boolean, radar: boolean} }> {
    constructor(props: { cxt: IContextData }) {
        super(props);
        this.state = {
            huds: [],
            form: {
                killfeed: false,
                radar: false
            }
        }
    }
    changeForm = (name: 'killfeed' | 'radar') => (e: any) => {
        const { form } = this.state;
        form[name] = !form[name];
        this.setState({form});
    }
    async componentDidMount() {
        const huds = await api.huds.get();
        this.setState({ huds });
    }
    startHUD(dir: string) {
        api.huds.start(dir);
    }
    render() {
        const { killfeed, radar } = this.state.form;
        return (
            <React.Fragment>

                <Row>
                    <Col md="12" className="config-container no-margin">
                        <Col md="6">
                            <FormGroup check>
                                <Label check>
                                    <Input type="checkbox" onChange={this.changeForm('radar')} checked={this.state.form.radar} />{' '}
                                    Use Boltgolt's radar
                                </Label>
                            </FormGroup>
                        </Col>
                        <Col md="6">
                            <FormGroup check>
                                <Label check>
                                    <Input type="checkbox" onChange={this.changeForm('killfeed')} checked={this.state.form.killfeed} />{' '}
                                    Use custom killfeed
                                </Label>
                            </FormGroup>
                        </Col>
                    </Col>
                    <Col md="12" className="config-container no-margin" style={{flexDirection:'column'}}>
                        <div>Type in CS:GO console:</div>
                        <code>exec {createCFG(radar, killfeed).file}</code>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {this.state.huds.map(hud => <Row key={hud.dir} className="hudRow">
                            <Col style={{width:'64px', flex:'unset',padding:0   }}>
                                <img src={`${config.isDev ? config.apiAddress : '/'}huds/${hud.dir}/thumbnail`} />
                            </Col>
                            <Col style={{flex:10, display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                <Row>
                                    <Col><strong>{hud.name}</strong> <span className='hudVersion'>({hud.version})</span></Col>
                                </Row>
                                <Row>
                                    <Col><i>{hud.author}</i></Col>
                                </Row>
                            </Col>
                            <Col style={{flex:1}} className="centered">
                                <i className="material-icons" onClick={() => this.startHUD(hud.dir)}>desktop_windows</i>
                            </Col>
                        </Row>)}
                    </Col>
                </Row>
            </React.Fragment>
        )
    }
}
