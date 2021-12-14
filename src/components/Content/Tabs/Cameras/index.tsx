import { useEffect, useState } from 'react';
import api from './../../../../api/api';
import { IContextData } from './../../../../components/Context';
import { useTranslation } from 'react-i18next';
import LabeledInput from '../../../LabeledInput';
import { CameraRoomPlayer, Player } from '../../../../api/interfaces';
import { GSI, socket } from '../Live/Live';
import { copyToClipboard } from '../../../../api/clipboard';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

interface SetPasswordProps {
	isOpen: boolean;
	toggle: () => void;
	save: () => void;
	setPassword: (password: string) => void;
	setPasswordConfirm: (password: string) => void;
	password: string;
	passwordConfirm: string;
}
interface IProps {
	cxt: IContextData;
}

const SetPasswordModal = ({
	isOpen,
	toggle,
	save,
	setPassword,
	setPasswordConfirm,
	password,
	passwordConfirm
}: SetPasswordProps) => {
	const { t } = useTranslation();
	const savePassword = () => {
		if (password !== passwordConfirm) return;
		save();
		toggle();
	};
	return (
		<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>Generate password</ModalHeader>
			<ModalBody>
				<LabeledInput
					label="Password"
					value={password}
					type="password"
					onChange={e => setPassword(e.target.value)}
				/>
				<LabeledInput
					label="Confirm Password"
					value={passwordConfirm}
					type="password"
					onChange={e => setPasswordConfirm(e.target.value)}
				/>
			</ModalBody>
			<ModalFooter className="no-padding">
				<div className="button wide green strong empty" onClick={toggle}>
					{t('common.cancel')}
				</div>
				<div
					className={`button wide green strong ${password !== passwordConfirm ? 'disabled' : ''}`}
					onClick={savePassword}
				>
					{t('common.save')}
				</div>
			</ModalFooter>
		</Modal>
	);
};

const Cameras = ({ cxt }: IProps) => {
	const [players, setPlayers] = useState<(CameraRoomPlayer | null)[]>([]);
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [room, setRoom] = useState('');
	const { t } = useTranslation();

	useEffect(() => {
		const loadPlayers = (steamids: string[]) => {
			api.cameras.get().then(data => {
				setPlayers(data.availablePlayers);
				setRoom(data.uuid);
				setPassword(data.password);
				setPasswordConfirm(data.password);
				setPlayers([
					...data.availablePlayers.map(player =>
						player ? { ...player, active: steamids.includes(player.steamid) } : player
					)
				]);
			});
		};
		loadPlayers([]);
		socket.on('playersOnline', (data: string[]) => {
			loadPlayers(data);
		});
		socket.emit('getConnectedPlayers');
	}, []);

	const regenerate = () => {
		api.cameras.regenerate().then(() => {
			api.cameras.get().then(data => {
				setRoom(data.uuid);
			});
		});
	};

	const save = (toggle = false) => {
		api.cameras.update(players.filter(player => !!player) as CameraRoomPlayer[], password, toggle);
	};

	const setPlayerHandler = (index: number) => (e: any) => {
		const playerId = e.target.value;
		if (!playerId || !cxt.players.find(player => player.steamid === playerId)) {
			players[index] = null;
			return;
		}
		const player = cxt.players.find(player => player.steamid === playerId);

		if (!player) return;

		players[index] = { steamid: player.steamid, label: player.username, allow: true, active: false };
		setPlayers([...players]);
	};

	const fillPlayersWithLiveTab = () => {
		if (!GSI.current) return;

		const players: (CameraRoomPlayer | null)[] = GSI.current.players.map(
			player => ({ steamid: player.steamid, label: player.name, allow: true, active: false } as CameraRoomPlayer)
		);
		for (let i = 0; i < 10; i++) {
			if (players[i]) continue;
			players[i] = null;
		}
		setPlayers([...players]);
		setTimeout(() => {
			save();
		}, 500);
	};

	const togglePlayerHandler = (index: number) => () => {
		const player = players[index];
		if (!player) return;

		player.allow = !player.allow;

		setPlayers([...players]);
		setTimeout(() => {
			save(true);
		}, 500);
	};

	const mapPlayers = (player: Player | CameraRoomPlayer) => {
		if ('username' in player) {
			return {
				steamid: player.steamid,
				label: player.username
			};
		}

		return {
			steamid: player.steamid,
			label: player.label
		};
	};

	const extraPlayers = players.filter(
		player => player && !cxt.players.find(pl => pl.steamid === player.steamid)
	) as CameraRoomPlayer[];

	const playersToList = [...cxt.players, ...extraPlayers].map(mapPlayers);

	return (
		<>
			<div className="tab-content-container cameras no-padding">
				{room ? (
					<div>
						<div
							style={{
								fontFamily: 'Rajdhani',
								textTransform: 'uppercase',
								fontSize: 14,
								fontWeight: 600
							}}
						>
							Send this to your players:
						</div>
						<div
							className="infobox"
							onClick={() => copyToClipboard(`https://lhm.gg/cameras/?&room=${room}`)}
						>
							https://lhm.gg/cameras/?&room={room}
							<div className="copy-link">Click & Copy</div>
						</div>
						<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<div className="button big wide strong green empty" onClick={regenerate}>
								RESET LINK
							</div>
							<div className="button big wide strong green" onClick={() => setIsOpen(!isOpen)}>
								Generate password
							</div>
						</div>
					</div>
				) : null}
				<SetPasswordModal
					password={password}
					passwordConfirm={passwordConfirm}
					setPassword={setPassword}
					setPasswordConfirm={setPasswordConfirm}
					isOpen={isOpen}
					toggle={() => setIsOpen(!isOpen)}
					save={save}
				/>
				<div className="cameras-container">
					{[...Array(10)]
						.map((_, i) => i)
						.map(index => (
							<div
								className="camera-input-container"
								key={`camera-${index}-${players[index]?.steamid || ''}`}
							>
								<LabeledInput
									key={`camera-${index}`}
									type="select"
									label={
										<div style={{ display: 'flex' }}>
											Player #{index + 1}
											<div
												className={`camera-status ${players[index]?.active ? 'active' : ''}`}
											/>
										</div>
									}
									name="type"
									onChange={setPlayerHandler(index)}
									value={players[index]?.steamid}
								>
									<option value="" defaultChecked>
										{t('common.players')}
									</option>
									{playersToList
										.filter(player => player.steamid)
										.sort((a, b) => (a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1))
										.map(player => (
											<option
												value={player.steamid}
												key={`${player.steamid}${index}`}
												disabled={
													!!(
														player.steamid !== players[index]?.steamid &&
														players.find(pl => pl && pl.steamid === player.steamid)
													)
												}
											>
												{player.label}
											</option>
										))}
								</LabeledInput>
								<div
									onClick={togglePlayerHandler(index)}
									className={`button green wide strong ${players[index]?.allow ? 'empty' : ''}`}
								>
									{players[index]?.allow ? 'Disable' : 'Enable'}
								</div>
							</div>
						))}
				</div>
			</div>
			<div className="action-container">
				{cxt.game === 'csgo' ? (
					<div className="button green strong big wide empty" onClick={fillPlayersWithLiveTab}>
						Fill from Live
					</div>
				) : null}
				<div className="button green strong big wide" onClick={() => save()}>
					Save
				</div>
			</div>
		</>
	);
};

export default Cameras;
