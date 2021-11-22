import { useEffect, useState } from 'react';
import api from './../../../../api/api';
import { IContextData } from './../../../../components/Context';
import { useTranslation } from 'react-i18next';
import LabeledInput from '../../../LabeledInput';
import { CameraRoomPlayer } from '../../../../api/interfaces';
import { GSI } from '../Live/Live';

interface IProps {
	cxt: IContextData;
}

const Cameras = ({ cxt }: IProps) => {
	const [players, setPlayers] = useState<(CameraRoomPlayer | null)[]>([]);
	const [room, setRoom] = useState('');
	const { t } = useTranslation();

	useEffect(() => {
		api.cameras.get().then(data => {
			setPlayers(data.availablePlayers);
			setRoom(data.uuid);
		});
	}, []);

	const save = () => {
		api.cameras.update(players as any);
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
		if(!GSI.current) return;

		const players: (CameraRoomPlayer | null)[] = GSI.current.players.map(player => ({ steamid: player.steamid, label: player.name, allow: true, active: false }) as CameraRoomPlayer);
		for(let i = 0; i < 10; i++){
			if(players[i]) continue;
			players[i] = null;
		}
		setPlayers([...players]);
		save();
	}

	const togglePlayerHandler = (index: number) => () => {
		const player = players[index];
		if(!player) return;

		player.allow = !player.allow;

		setPlayers([...players]);
	}

	return (
		<>
			<div className="tab-content-container cameras no-padding">
				{room ? (
					<div className="infobox">
						Send this to your players: https://lhm.gg/cameras/?&room={room}
					</div>
				) : null}
				<div className="cameras-container">
					{[...Array(10)]
						.map((_, i) => i)
						.map(index => (
							<div className="camera-input-container" key={`camera-${index}-${players[index]?.steamid || ''}`}>
								<LabeledInput
									key={`camera-${index}`}
									type="select"
									label={<div style={{display:'flex'}}>Player #{index + 1}<div className={`camera-status ${players[index]?.active ? 'active':''}`} /></div>}
									name="type"
									onChange={setPlayerHandler(index)}
									value={players[index]?.steamid}
								>
									<option value="" defaultChecked>
										{t('common.players')}
									</option>
									{cxt.players
										.filter(player => player.steamid)
										.sort((a, b) => (a.username.toLowerCase() < b.username.toLowerCase() ? -1 : 1))
										.map(player => (
											<option value={player.steamid} key={`${player.steamid}${index}`}>
												{player.username}
											</option>
										))}
								</LabeledInput>
								<div onClick={togglePlayerHandler(index)} className={`button green wide ${players[index]?.allow ? 'empty':''}`}>{players[index]?.allow ? 'Disable' : 'Enable'}</div>
							</div>
						))}
				</div>
			</div>
			<div className="action-container">
				<div className="button green strong big wide empty" onClick={fillPlayersWithLiveTab}>
					Fill from Live
				</div>
				<div className="button green strong big wide" onClick={save}>
					Save cameras
				</div>
			</div>
		</>
	);
};

export default Cameras;
