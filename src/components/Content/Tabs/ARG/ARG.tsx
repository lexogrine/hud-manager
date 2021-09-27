import { useCallback, useEffect, useState } from 'react';
import { Row, Button, Col, Input } from 'reactstrap';
import api, { Item } from '../../../../api/api';
import { socket } from '../Live/Live';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import './arg.scss';
import { Card } from './ARGEntry';

const ARG = () => {
	const [isConnected, setIsConnected] = useState(false);
	const [delay, setDelay] = useState(7);
	const [pcID, setPCID] = useState('');


	const [cards, setCards] = useState<Item[]>([
		{
			id: 'multikills',
			text: 'Prioritize multi kills',
			active: true
		},
		{
			id: 'headshots',
			text: 'Prioritize headshots',
			active: true
		},
		{
			id: 'teamkill',
			text: 'Prioritize team kills',
			active: false
		}
	]);

	const moveCard = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			const dragCard = cards[dragIndex];
			setCards(
				update(cards, {
					$splice: [
						[dragIndex, 1],
						[hoverIndex, 0, dragCard]
					]
				})
			);
		},
		[cards]
	);

	const connect = () => {
		api.arg.connect(pcID);
	};

	const onDelayChange: React.ChangeEventHandler<HTMLInputElement> = event => {
		const delay = Number(event.target.value);
		api.arg.setDelay(delay);
	};

	const toggleById = (id: string) => () => {
		setCards(cards.map(card => ({ ...card, active: card.id === id ? !card.active : card.active })));
	};

	const renderCard = (card: Item, index: number) => {
		return (
			<Card
				key={card.id}
				index={index}
				id={card.id}
				active={card.active}
				text={card.text}
				moveCard={moveCard}
				toggle={toggleById(card.id)}
			/>
		);
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
				<span className={isConnected ? 'connected' : 'disconnected'}>
					<div className="status"></div>
					{isConnected ? 'CONNECTED' : 'DISCONNECTED'}
				</span>
			</div>
			<div className={`tab-content-container no-padding arg`}>
				<Row className="config-container">
					<Col md="12">
						<DndProvider backend={HTML5Backend}>
							<div className="">{cards.map((card, i) => renderCard(card, i))}</div>
						</DndProvider>
					</Col>
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
