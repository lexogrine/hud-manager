import React, { Component } from 'react';
import { Row, Col, UncontrolledCollapse } from 'reactstrap';
import Config from './../../../../api/config';
import Tip from './../../../Tooltip';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import HyperLink from './../../../../styles/Hyperlink.png';
import Settings from './../../../../styles/Settings.png';
import Display from './../../../../styles/Display.png';
import Map from './../../../../styles/Map.png';
import Killfeed from './../../../../styles/Killfeed.png';

const hashCode = (s: string) => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0).toString();

interface IProps {
    hud: I.HUD;
    toggleConfig: (hud: I.HUD) => any;
}

export default class HudEntry extends Component<IProps> {
    startHUD(dir: string) {
        api.huds.start(dir);
    }
    /*setHUD = (url: string) => {
        socket.emit("set_active_hlae", url);
    }*/
    render() {
        const { hud, toggleConfig } = this.props;
        return (
            <Row key={hud.dir} className="hudRow">
                <Col s={12}>
                    <Row>
                        <Col className='centered thumb'>
                            <img src={`${Config.isDev ? Config.apiAddress : '/'}huds/${hud.dir}/thumbnail`} alt={`${hud.name}`} />
                        </Col>
                        <Col style={{ flex: 10, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                            <Row>
                                <Col><strong className="hudName">{hud.isDev ? '[DEV] ' : ''}{hud.name}</strong> <span className='hudVersion'>({hud.version})</span></Col>
                            </Row>
                            <Row>
                                <Col className="hudAuthor"><div>{hud.author}</div></Col>
                            </Row>
                            {hud.killfeed || hud.radar ? <Row>
                                <Col>
                                    {hud.radar ? <Tip id={`radar_support_${hud.dir}`} className="radar_support" label={<img src={Map} className='action' alt="Supports boltgolts radar"/>}>Includes Boltgolt's radar</Tip> : ''}
                                    {hud.killfeed ? <Tip id={`killfeed_support_${hud.dir}`} className="killfeed_support" label={<img src={Killfeed} className='action' alt="Supports custom killfeed" />}>Includes custom killfeed</Tip> : ''}
                                </Col>
                            </Row> : ''}
                        </Col>
                        <Col style={{ flex: 1 }} className="centered">
                            {/*<i className="material-icons" id={`hud_link_${hashCode(hud.dir)}`}>link</i>*/}
                            <img src={HyperLink} id={`hud_link_${hashCode(hud.dir)}`} className='action' alt="Local network's HUD's URL"/>
                            {hud.panel ? <img src={Settings} onClick={toggleConfig(hud)} className='action' alt="HUD's panel" /> : ''}
                            { Config.isElectron ? <img src={Display} onClick={() => this.startHUD(hud.dir)} className='action' alt="Start HUD" /> : null}
                            {/* Config.isElectron ? <Button className="purple-btn round-btn" onClick={() => this.setHUD(hud.url)}>Set</Button>: null*/}
                        </Col>
                    </Row>
                    <Row>
                        <Col s={12}>
                            <div className="match_data">
                                <UncontrolledCollapse toggler={`#hud_link_${hashCode(hud.dir)}`}>
                                    <code>{hud.url}</code>
                                </UncontrolledCollapse>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}