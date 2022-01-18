import { useCallback, useEffect, useState } from 'react';
import { Row, Col, Input } from 'reactstrap';
import api from '../../../../api/api';
import { socket } from '../Live/Live';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import './arg.scss';
import { Card } from './ARGEntry';
import { Item } from '../../../../api/interfaces';
import Checkbox from '../../../Checkbox';

let preTimeTimeout: NodeJS.Timeout | null = null;
let postTimeTimeout: NodeJS.Timeout | null = null;

const ARG = () => {
	const [isConnected, setIsConnected] = useState(false);
	const [delay, setDelay] = useState(7);
	const [pcID, setPCID] = useState('');
	const [isOnline, setOnline] = useState(true);
	const [preTime, setPreTime] = useState(1500);
	const [postTime, setPostTime ] = useState(1500);
	const [saveClips, setSaveClips] = useState(false);
	const [useHLAE, setUseHLAE] = useState(false);

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

	const toggleOnline = () => {
		api.arg.setOnline(!isOnline);
		setOnline(!isOnline);
	}
	const safebandHandler = (type: 'pre' | 'post'):React.ChangeEventHandler<HTMLInputElement> => event => {
		const value = Number(event.target.value);
		if(type === 'post') setPostTime(value);
		else setPreTime(value);

		if(type === 'pre'){
			if(preTimeTimeout){
				clearTimeout(preTimeTimeout);
			}

			preTimeTimeout = setTimeout(async () => {
				await api.arg.setSafeband(value, postTime);

				preTimeTimeout = null;
			}, 1000);
		} else {
			if(postTimeTimeout){
				clearTimeout(postTimeTimeout);
			}

			postTimeTimeout = setTimeout(async () => {
				await api.arg.setSafeband(preTime, value);

				postTimeTimeout = null;
			}, 1000);
		}
	}
	const connect = () => {
		api.arg.connect(pcID);
	};

	const onDelayChange: React.ChangeEventHandler<HTMLInputElement> = event => {
		const delay = Number(event.target.value);
		api.arg.setDelay(delay);
	};
	const onClipsChange = () => {
		api.arg.setClips(!saveClips);
	};

	const onHLAEChange = () => {
		api.arg.setHLAE(!useHLAE);
	};

	const save = (overwrite?: Item[]) => {
		api.arg.save(overwrite || cards);
	};
	const toggleById = (id: string) => () => {
		const result = cards.map(card => ({ ...card, active: card.id === id ? !card.active : card.active }));
		save(result);
		setCards(result);
	};

	const renderCard = (card: Item, index: number) => {
		return (
			<Card
				key={card.id}
				index={index}
				id={card.id}
				active={card.active}
				save={save}
				text={card.text}
				moveCard={moveCard}
				toggle={toggleById(card.id)}
			/>
		);
	};

	useEffect(() => {
		type Status = {
			pcID: string;
			delay: number;
			saveClips: boolean;
			online: boolean,
			useHLAE: boolean,
			safeBand: {
				preTime: number;
				postTime: number;
			};
		}
		
		socket.on('ARGStatus', (status: Status) => {
			console.log('update')
			setIsConnected(!!status.pcID);
			setDelay(status.delay);
			if(status.pcID) {
				setPCID(status.pcID);
			}
			setSaveClips(status.saveClips);
			setOnline(status.online);
			setPostTime(status.safeBand.postTime);
			setPreTime(status.safeBand.preTime);
			setUseHLAE(status.useHLAE);
		});
		setTimeout(() => {
			api.arg.requestStatus();
			api.arg
				.get()
				.then(order => {
					setCards(order);
				})
				.catch(() => {});
		}, 100);
	}, []);
	console.log(useHLAE);
	return (
		<>
			{/*<div className="tab-title-container arg-title">
				ARG
				<span className={isConnected ? 'connected' : 'disconnected'}>
					<div className="status"></div>
					{isConnected ? 'CONNECTED' : 'DISCONNECTED'}
				</span>
			</div>*/}
			<div className={`tab-content-container no-padding arg`}>
				<Row className="config-container">
					<Col md="12">
						<DndProvider backend={HTML5Backend}>
							<div className="">{cards.map((card, i) => renderCard(card, i))}</div>
						</DndProvider>
					</Col>
				</Row>
			</div>
			<div className="arg-options no-border">
				<div className="arg-config-entry">
					<div className="config-description">Safeband</div>
				<div className="arg-config-entry">
					<div className="config-description">Use HLAE?</div>
					<Checkbox checked={useHLAE} onChange={onHLAEChange}  />
				</div>
				</div>
				<div className="arg-config-entry">
					<div className="config-description">Before kill</div>
					<Input value={preTime} type="number" onChange={safebandHandler('pre')} />
				</div>
				<div className="arg-config-entry">
					<div className="config-description">After kill</div>
					<Input value={postTime} type="number" onChange={safebandHandler('post')} />
				</div>
			</div>
			<div className="arg-options">
				<div className="arg-config-entry">
					<div className="config-description">Save clips?</div>
					<Checkbox checked={saveClips} onChange={onClipsChange} />
				</div>
				<div className="arg-config-entry">
					<div className="config-description">Delay Config</div>
					<Input value={delay} type="number" onChange={onDelayChange} />
				</div>
				<div className="arg-config-entry">
					<div className="config-description">Computer ID</div>
					<Input
						value={pcID}
						disabled={isConnected}
						placeholder="Computer ID"
						onChange={e => setPCID(e.target.value)}
					/>
				</div>
			</div>
			<div className="action-container">
				<div
					className={`button green strong big wide ${isConnected ? '' : 'empty'} ${!pcID ? 'disabled' : ''}`}
					onClick={isConnected ? api.arg.disconnect : connect}
				>
					{isConnected ? 'DISCONNECT' : 'CONNECT'}
				</div>
				<div
					className={`button green strong big wide ${isOnline ? 'empty' : ''}`}
					onClick={toggleOnline}
				>
					{isOnline ? 'Turn off' : 'Turn on'}
				</div>
			</div>
		</>
	);
};

export default ARG;
