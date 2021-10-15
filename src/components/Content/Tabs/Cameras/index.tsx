import { useEffect, useState } from 'react';
import api from './../../../../api/api';
import { IContextData } from './../../../../components/Context';
import { useTranslation } from 'react-i18next';
import LabeledInput from '../../../LabeledInput';
import { CameraRoomPlayer } from '../../../../api/interfaces';

interface IProps {
    cxt: IContextData;
}



const Cameras = ({ cxt }: IProps) => {
    const [players, setPlayers] = useState<(CameraRoomPlayer | null)[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        api.cameras.get().then(players => {

            setPlayers(players.availablePlayers);
        });
    }, []);

    const save = () => {
        api.cameras.update(players as any);
    }

    const setPlayerHandler = (index: number) => (e: any) => {
        const playerId = e.target.value;
        if(!playerId || !cxt.players.find(player => player.steamid === playerId)){
            players[index] = null;
            return;
        }
        const player = cxt.players.find(player => player.steamid === playerId);

        if(!player) return;

        players[index] = { steamid: player.steamid , label: player.username };
        setPlayers([...players]);
    }

    return (
        <>
            <div className="tab-content-container cameras no-padding">
                {
                    [...Array(10)].map((_, i) => i).map(index => (
                        <LabeledInput
                            key={`camera-${index}`}
                            type="select"
                            label={`Player #${index+1}`}
                            name="type"
                            onChange={setPlayerHandler(index)}
                            value={players[index]?.steamid}
                        >
                            <option value="" defaultChecked>
                                {t('common.players')}
                            </option>
                            {cxt.players
                                .concat()
                                .sort((a, b) => (a.username.toLowerCase() < b.username.toLowerCase() ? -1 : 1))
                                .map(player => (
                                <option value={player.steamid} key={`${player.steamid}${index}`}>
                                    {player.username}
                                </option>
                            ))}
                        </LabeledInput>
                    ))
                }
            </div>
            <div className="action-container">
                <div className="button green strong big wide" onClick={save}>
                    Save cameras
                </div>
            </div>
        </>
    );
};

export default Cameras;
