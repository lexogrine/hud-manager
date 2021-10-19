import Layout from './layout/Layout';
import './styles/styles.scss';
import './styles/dark-mode.css';
import { socket } from './components/Content/Tabs/Live/Live';
import './i18n/i18n';
import { Component } from 'react';

interface IState {
	hudURL: string | null;
}
export default class App extends Component<any, IState> {
	constructor(props: any) {
		super(props);
		this.state = {
			hudURL: null
		};
	}
	componentDidMount() {
		socket.on('active_hlae', (url: string | null) => {
			if (url === this.state.hudURL) return;
			this.setState({ hudURL: url });
		});
		//socket.emit('get_active_hlae');
		const url = new URL(window.location.href);
		const isHLAEGUI = url.searchParams.get('hlaegui');
		if (isHLAEGUI !== null) document.body.classList.add('hlaegui');
	}
	render() {
		const url = new URL(window.location.href);
		const isHLAEGUI = url.searchParams.get('hlaegui');

		if (isHLAEGUI === null) return <Layout></Layout>;
		if (!this.state.hudURL) return null;
		return (
			<iframe
				src={this.state.hudURL}
				style={{ border: 'none', width: '100vw', height: '100%', overflow: 'hidden' }}
				title="AFX Mode HUD"
			></iframe>
		);
	}
}
