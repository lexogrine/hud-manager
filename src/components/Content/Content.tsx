import React from 'react';
import Navbar from './Navbar/Navbar';
import Tabs from './Tabs/Tabs';
import api from './../../api/api';

export default class Content extends React.Component<{}, { activeTab: string }> {
    constructor(props: {}) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            activeTab: 'create_match'
        };
    }

    async componentDidMount(){
        /*const teams = await api.teams.get();
        console.log(teams);*/
    }

    toggle(tab: string) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        return (
            <div>
                <Navbar activeTab={this.state.activeTab} toggle={this.toggle}/>
                <Tabs activeTab={this.state.activeTab} />
            </div>
        );
    }
}
