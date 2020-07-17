import React from 'react';
import Navbar from './Navbar/Navbar';
import Tabs from './Tabs/Tabs';
import { Col } from 'reactstrap';
import api from '../../api/api';

interface IState {
    activeTab: string,
    data: any,
    gsi: boolean,
}

export default class Content extends React.Component<{}, IState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            activeTab: 'create_match',
            data: null,
            gsi: true
        };
    }

    checkGSI = async () =>{ 
        const response = await api.gamestate.check();
        return this.setState({ gsi: response.success });
    }

    toggle = (tab: string, data?: any) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab,
                data: data || null
            });
        }
    }

    componentDidMount(){
        this.checkGSI();
    }

    render() {
        return (
            <div className="main-container">
                <Navbar activeTab={this.state.activeTab} toggle={this.toggle} gsi={this.state.gsi}/>
                <Col>
                    <Tabs activeTab={this.state.activeTab} data={this.state.data} toggle={this.toggle} gsiCheck={this.checkGSI}/>
                </Col>
            </div>
        );
    }
}
