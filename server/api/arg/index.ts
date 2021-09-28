import { ioPromise } from '../../socket';
import { SimpleWebSocket } from 'simple-websockets';
import { CSGO } from 'csgogsi-socket';
import { Item } from '../../../types/interfaces';

export const argSocket: { socket: SimpleWebSocket | null; id: string | null; delay: number, order: Item[] } = {
	delay: 7,
	socket: null,
	id: null,
	order: [
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
	]
};

export const getIP = (code: string) => {
	const ipNumbers = code.split('-').map(n => parseInt(n, 16));

	const port = ipNumbers.pop();

	const ip = `${ipNumbers.join('.')}:${port}`;
	const address = `ws://${ip}`;
	return address;
};

export const sendARGStatus = async () => {
	const io = await ioPromise;
	io.emit('ARGStatus', argSocket?.id, argSocket.delay);
};

export const connectToARG = (code: string) => {
	if (argSocket.socket) {
		return;
	}
	const socketAddress = getIP(code);

	const onClose = () => {
		argSocket.socket = null;
		argSocket.id = null;
		sendARGStatus();
	};

	const socket = new SimpleWebSocket(socketAddress);

	socket.on('connection', () => {
		socket.send('register', argSocket.order.map(item => ({ id: item.id, active: item.active })));
	});

	socket.on('registered', sendARGStatus);

	argSocket.socket = socket;
	argSocket.id = code;

	if ('on' in socket._socket) {
		socket._socket.on('error', onClose);
		socket._socket.on('close', onClose);
	}
};

interface ARGKillEntry {
	killer: string;
	timestamp: number;
	round: number;
	killerHealth: number;
	newKills: number;
	name: string;
	teamkill: boolean;
	headshot: boolean;
}

interface KillStatistics {
	steamid: string;
	kills: number;
	health: number;
	name: string;
	headshots: number;
}

const getNewKills = (kill: KillStatistics, oldKillsStatistics: KillStatistics[]) => {
	const oldKillEntry = oldKillsStatistics.find(entry => entry.steamid === kill.steamid);
	if (!oldKillEntry) return { kills: 0, headshot: false, teamkill: false };
	if (kill.kills - oldKillEntry.kills < 0) return { kills: 0, headshot: false, teamkill: true };
	return {
		kills: kill.kills - oldKillEntry.kills,
		headshot: kill.headshots > oldKillEntry.headshots,
		teamkill: false
	};
};

export const sendKillsToARG = (last: CSGO, csgo: CSGO) => {
	if (last.round?.phase === 'freezetime' && csgo.round?.phase !== 'freezetime' && argSocket.socket) {
		argSocket.socket.send('clearReplay');
	} else if (csgo.round?.phase === 'freezetime' && last.round?.phase !== 'freezetime' && argSocket.socket) {
		argSocket.socket.send('showReplay');
	}
	const playerKills: KillStatistics[] = csgo.players.map(player => ({
		steamid: player.steamid,
		kills: player.stats.kills,
		health: player.state.health,
		name: player.name,
		headshots: player.state.round_killhs
	}));
	const oldPlayerKills: KillStatistics[] = last.players.map(player => ({
		steamid: player.steamid,
		kills: player.stats.kills,
		health: player.state.health,
		name: player.name,
		headshots: player.state.round_killhs
	}));

	const argKillEntries: ARGKillEntry[] = [];

	for (const playerKill of playerKills) {
		const newKills = getNewKills(playerKill, oldPlayerKills);
		if (!newKills.kills) continue;

		argKillEntries.push({
			killer: playerKill.steamid,
			timestamp: new Date().getTime() + argSocket.delay * 1000,
			round: csgo.map.round,
			killerHealth: playerKill.health,
			newKills: newKills.kills,
			name: playerKill.name,
			teamkill: newKills.teamkill,
			headshot: newKills.headshot
		});
	}

	if (argSocket.socket && argKillEntries.length) {
		argSocket.socket.send('kills', argKillEntries);
	}
};
