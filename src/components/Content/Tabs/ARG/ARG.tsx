import { useEffect, useState } from 'react';
import { Row, Button, Col, Input } from 'reactstrap';
import api from '../../../../api/api';
import { socket } from '../Live/Live';
import './arg.scss';

const ARG = () => {
	const [isConnected, setIsConnected] = useState(false);
	const [delay, setDelay] = useState(7);
	const [pcID, setPCID] = useState('');

	const connect = () => {
		api.arg.connect(pcID);
	};

	const onDelayChange: React.ChangeEventHandler<HTMLInputElement> = event => {
		const delay = Number(event.target.value);
		api.arg.setDelay(delay);
	};

	useEffect(() => {
		socket.on('ARGStatus', (pcID: string | null, delay: number) => {
			setIsConnected(!!pcID);
			setDelay(delay);
			if (pcID) {
				setPCID(pcID);
			}
		});
		setTimeout(() => {
			api.arg.requestStatus();
		}, 100);
	}, []);

	return (
		<>
			<div className="tab-title-container arg-title">
				ARG
				<span className={isConnected ? 'connected':'disconnected'}><div className='status'></div>{isConnected ? 'CONNECTED':'DISCONNECTED'}</span>
			</div>
			<div className={`tab-content-container no-padding arg`}>
				<Row className="config-container">
					<Col md="12" className="config-entry">
						<div className="config-description">Delay Config</div>
						<Input value={delay} type="number" onChange={onDelayChange} />
					</Col>
					<Col md="12" className="config-entry">
						<div className="config-description">Computer ID</div>
						<Input value={pcID} disabled={isConnected} onChange={e => setPCID(e.target.value)} />
					</Col>
				</Row>

				<Row>
					<Col className="main-buttons-container">
						<Button onClick={isConnected ? api.arg.disconnect : connect} color="primary">
							{isConnected ? 'DISCONNECT' : 'CONNECT'}
						</Button>
					</Col>
				</Row>
			</div>
		</>
	);
};

export default ARG;
