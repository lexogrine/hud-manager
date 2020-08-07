import React from 'react';
import { Col } from 'reactstrap';
import api from '../../api/api';
import Navbar from './Navbar/Navbar';
import Tabs from './Tabs/Tabs';

interface IState {
	activeTab: string;
	data: any;
	gsi: boolean;
	configs: boolean;
}

export default class Content extends React.Component<{}, IState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			activeTab: 'create_match',
			data: null,
			gsi: true,
			configs: true
		};
	}

	checkFiles = async () => {
		const responses = await Promise.all([api.gamestate.check(), api.cfgs.check()]);
		return this.setState({ gsi: responses[0].success, configs: responses[1].success });
	};

	toggle = (tab: string, data?: any) => {
		if (this.state.activeTab !== tab) {
			this.setState({
				activeTab: tab,
				data: data || null
			});
		}
	};

	componentDidMount() {
		this.checkFiles();
	}

	render() {
		return (
			<div className="main-container">
				<Navbar
					activeTab={this.state.activeTab}
					toggle={this.toggle}
					files={this.state.gsi && this.state.configs}
				/>
				<Col>
					<Tabs
						activeTab={this.state.activeTab}
						data={this.state.data}
						toggle={this.toggle}
						gsiCheck={this.checkFiles}
					/>
				</Col>
			</div>
		);
	}
}
