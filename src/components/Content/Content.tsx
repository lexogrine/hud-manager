import React from 'react';
import Navbar from './Navbar/Navbar';
import Tabs from './Tabs/Tabs';
import api from './../../api/api';
import { Col } from 'reactstrap';

export default class Content extends React.Component<{}, { activeTab: string, data: any }> {
    constructor(props: {}) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            activeTab: 'create_match',
            data: null
        };
    }

    async componentDidMount(){
        /*const teams = await api.teams.get();
        console.log(teams);*/
    }

    toggle(tab: string, data?: any) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab,
                data: data || null
            });
        }
    }

    render() {
        return (
            <div>
                <Navbar activeTab={this.state.activeTab} toggle={this.toggle}/>
                <Col lg={{size:10, offset:1}}>
                    <Tabs activeTab={this.state.activeTab} data={this.state.data} toggle={this.toggle}/>
                </Col>
            </div>
        );
    }
}
