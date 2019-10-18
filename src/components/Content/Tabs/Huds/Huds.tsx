import React from 'react';
import { IContextData } from './../../../../components/Context';
import api from './../../../../api/api';
import config from './../../../../api/config';
import * as I from './../../../../api/interfaces';
import { Row, Col } from 'reactstrap';

export default class Huds extends React.Component<{cxt: IContextData}, {huds: I.HUD[]}> {
    constructor(props: {cxt: IContextData}){
        super(props);
        this.state = {
            huds: []
        }
    }
    async componentDidMount(){
        const huds = await api.huds.get();
        this.setState({huds});
    }
    startHUD(dir: string){
        api.huds.start(dir);
    }
    render() {
        return (
            <Row>
                <Col>
                    {this.state.huds.map(hud => <Row className="hudRow">
                        <Col md={1}>
                            //IMG
                        </Col>
                        <Col md={10}>
                            <Row>
                                <Col><strong>{hud.name}</strong> <span className='hudVersion'>({hud.version})</span></Col>
                            </Row>
                            <Row>
                                <Col><i>{hud.author}</i></Col>
                            </Row>
                        </Col>
                        <Col md={1} className="centered">
                            <i className="material-icons" onClick={() => this.startHUD(hud.dir)}>desktop_windows</i>
                        </Col>
                    </Row>)}
                </Col>
            </Row>
        )
    }
}
