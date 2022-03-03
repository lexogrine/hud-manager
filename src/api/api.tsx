import { CustomFieldEntry, AvailableGames, CloudSyncStatus, LastLaunchedVersion } from '../../types/interfaces';
import config from './config';
import * as I from './interfaces';
import { PlayerExtension } from 'csgogsi-socket';

const apiUrl = config.apiAddress;
interface DB {
	teams: I.Team[];
	players: I.Player[];
}
type SessionStore = {
	workspace: number | null;
	game: I.AvailableGames | null;
};
function arrayBufferToBase64(buffer: any) {
	let binary = '';
	const bytes = [].slice.call(new Uint8Array(buffer));

	bytes.forEach(b => (binary += String.fromCharCode(b)));

	return window.btoa(binary);
}

export const maxWins = (type: I.BOTypes) => {
	switch (type) {
		case 'bo1':
			return 1;
		case 'bo3':
			return 2;
		case 'bo5':
			return 3;
		case 'bo7':
			return 4;
		case 'bo9':
			return 5;
		default:
			return 2;
	}
};
const apiHandler: <T>(url: string, method?: string, body?: any, credentials?: boolean) => Promise<T> = (
	url,
	method = 'GET',
	body,
	credentials
) => {
	const options: RequestInit = {
		method,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		credentials: credentials ? 'include' : undefined
	};
	if (body) {
		options.body = JSON.stringify(body);
	}
	let data: any = null;
	return fetch(url, options).then(res => {
		data = res;
		return res.json().catch(() => data && data.status < 300);
	});
};

export function clone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

export async function apiV2<T>(url: string, method = 'GET', body?: any) {
	return apiHandler<T>(`${config.isDev ? apiUrl : '/'}api/${url}`, method, body);
	/*const options: RequestInit = {
        method,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    }
    if (body) {
        options.body = JSON.stringify(body)
    }
    let data: any = null;
    return fetch(`${config.isDev ? apiUrl : '/'}api/${url}`, options)
        .then(res => {
            data = res;
            return res.json().catch(_e => data && data.status < 300)
        });*/
}

export default {
	players: {
		get: () => apiV2<I.Player[]>('players'),
		add: async (player: any) => await apiV2('players', 'POST', player),
		update: async (id: string, player: any) => await apiV2(`players/${id}`, 'PATCH', player),
		delete: async (id: string | string[]) =>
			await apiV2(`players/${typeof id === 'string' ? id : id.join(';')}`, 'DELETE'),
		getAvatar: async (id: string) => {
			fetch(`${apiUrl}api/players/avatar/${id}`);
		},
		import: (data: string) => apiV2('players/import', 'POST', { data }),
		fields: {
			get: () => apiV2<CustomFieldEntry[]>('players/fields'),
			update: (fields: CustomFieldEntry[]) => apiV2<CustomFieldEntry[]>('players/fields', 'PATCH', fields)
		},
		replaceUsernames: (players: PlayerExtension[]) => apiV2('replaceWithMirv', 'POST', { players })
	},
	teams: {
		get: async () => apiV2<I.Team[]>('teams'),
		add: async (team: any) => await apiV2('teams', 'POST', team),
		update: async (id: string, team: any) => await apiV2(`teams/${id}`, 'PATCH', team),
		delete: async (id: string | string[]) =>
			await apiV2(`teams/${typeof id === 'string' ? id : id.join(';')}`, 'DELETE'),
		import: (data: string) => apiV2('teams/import', 'POST', { data }),
		getLogo: async (id: string) => {
			const response = await fetch(`${apiUrl}api/teams/logo/${id}`);
			return response;
		},
		fields: {
			get: () => apiV2<CustomFieldEntry[]>('teams/fields'),
			update: (fields: CustomFieldEntry[]) => apiV2<CustomFieldEntry[]>('teams/fields', 'PATCH', fields)
		}
	},
	arg: {
		connect: (id: string) => apiV2('arg', 'POST', { id }),
		disconnect: () => apiV2('arg', 'DELETE'),
		requestStatus: () => apiV2('arg'),
		setDelay: (delay: number) => apiV2('arg/delay', 'POST', { delay }),
		setClips: (saveClips: boolean) => apiV2('arg/save', 'POST', { saveClips }),
		save: (order: I.Item[]) => apiV2('arg/order', 'POST', order),
		get: (): Promise<I.Item[]> => apiV2('arg/order'),
		setOnline: (online: boolean) => apiV2('arg/online', 'POST', { online }),
		setHLAE: (hlae: boolean) => apiV2('arg/hlae', 'POST', { hlae }),
		setSafeband: (preTime: number, postTime: number) => apiV2('arg/safeband', 'POST', { preTime, postTime })
	},
	config: {
		get: async (): Promise<I.ExtendedConfig> => await apiV2('config'),
		update: async (config: I.Config) => await apiV2('config', 'PATCH', config),
		download: async (target: 'gsi' | 'cfgs' | 'db') => {
			if (config.isElectron) {
				return await apiV2(`${target}/download`);
			}
			window.location.assign(`${config.isDev ? apiUrl : '/'}api/${target}/download`);
		},
		getVersion: (): Promise<{ version: string }> => apiV2('version'),
		getLastVersion: (): Promise<LastLaunchedVersion> => apiV2('version/last'),
		setLastVersion: (version: string, releaseDate: string) =>
			apiV2('version/last', 'POST', { version, releaseDate })
	},
	cameras: {
		get: (): Promise<{ availablePlayers: I.CameraRoomPlayer[]; uuid: string; password: string }> => apiV2('camera'),
		update: (players: I.CameraRoomPlayer[], password: string, toggle: boolean) =>
			apiV2(toggle ? 'camera?&toggle=true' : 'camera', 'POST', { players, password }),
		regenerate: () => apiV2('camera', 'PATCH')
	},
	cfgs: {
		check: async (game: 'csgo' | 'dota2'): Promise<I.CFGGSIObject> => await apiV2(`cfg?game=${game}`),
		create: async (game: 'csgo' | 'dota2'): Promise<I.CFGGSIObject> => await apiV2(`cfg?game=${game}`, 'PUT')
	},
	gamestate: {
		check: async (game: 'csgo' | 'dota2'): Promise<I.CFGGSIObject> => await apiV2(`gsi?game=${game}`),
		create: async (game: 'csgo' | 'dota2'): Promise<I.CFGGSIObject> => await apiV2(`gsi?game=${game}`, 'PUT')
	},
	game: {
		run: async (config: { radar: boolean; killfeed: boolean; afx: boolean; autoexec: boolean }) =>
			await apiV2(`game/run`, 'POST', config),
		runTest: () => apiV2('test', 'POST'),
		toggleLoop: () => apiV2('test/loop', 'POST')
	},
	games: {
		getCurrent: (): Promise<{ game: AvailableGames; init: boolean }> => apiV2(`games/current`),
		startServices: (game: AvailableGames): Promise<{ result: CloudSyncStatus }> => apiV2(`games/start/${game}`)
	},
	cloud: {
		upload: (force = false) => apiV2(force ? 'cloud/upload?&replace=force' : 'cloud/upload', 'POST'),
		download: () => apiV2('cloud/download', 'POST'),
		size: (): Promise<{ size: number }> => apiV2('cloud/size')
	},
	huds: {
		get: async (): Promise<I.HUD[]> => await apiV2('huds'),
		start: async (hudDir: string) => await apiV2(`huds/${hudDir}/start`, 'POST'),
		close: async (hudDir: string) => await apiV2(`huds/${hudDir}/close`, 'POST'),
		openDirectory: async () => await apiV2(`huds`, 'POST'),
		save: async (hud: string, name: string) => await apiV2(`huds/add`, 'POST', { hud, name }),
		delete: async (hudDir: string) => await apiV2(`huds?hudDir=${hudDir}`, 'DELETE'),
		deleteFromCloud: async (uuid: string) => await apiV2(`huds/delete/${uuid}`, 'DELETE'),
		download: (uuid: string): Promise<{ result: I.HUD | null }> => apiV2(`huds/download/${uuid}`),
		upload: (hudDir: string): Promise<any> => apiV2(`huds/upload/${hudDir}`, 'POST')
	},
	machine: {
		get: async (): Promise<{ id: string }> => await apiV2('machine')
	},
	match: {
		get: async (): Promise<I.Match[]> => await apiV2('match?full'),
		set: async (match: I.Match[]): Promise<I.Match[]> => apiV2('match', 'PATCH', match),
		add: async (match: I.Match) => apiV2('match', 'POST', match),
		update: async (id: string, match: any) => await apiV2(`match/${id}`, 'PATCH', match),
		delete: async (id: string) => await apiV2(`match/${id}`, 'DELETE'),
		getMaps: async (): Promise<string[]> => await apiV2('maps')
	},
	tournaments: {
		get: async (): Promise<I.Tournament[]> => await apiV2('tournaments'),
		add: (tournament: {
			name: string;
			logo: string;
			playoffTeams: number;
			playoffType: string;
			groupType?: string;
			groupTeams?: number;
			phases?: number;
			groupPhases?: number;
		}): Promise<I.Tournament> => apiV2('tournaments', 'POST', tournament),
		bind: (tournamentId: string, matchId: string, matchupId: string) =>
			apiV2(`tournaments/${tournamentId}`, 'POST', { matchId, matchupId }),
		delete: (tournamentId: string) => apiV2(`tournaments/${tournamentId}`, 'DELETE'),
		update: (tournamentId: string, data: { name: string; logo: string }) =>
			apiV2(`tournaments/${tournamentId}`, 'PATCH', data)
	},
	user: {
		login: (username: string, password: string, token: string): Promise<{ success: boolean; message: string }> =>
			apiV2('auth', 'POST', { username, password, token }),
		logout: () => apiV2('auth', 'DELETE'),
		getCurrent: (): Promise<(I.CustomerData & { session: SessionStore }) | { message: string; success: boolean }> =>
			apiV2('auth'),
		setWorkspace: (workspaceId: number | null): Promise<{ success: boolean; message: string }> =>
			apiV2('workspace', 'POST', { workspaceId })
	},
	ar: {
		get: async (): Promise<I.ARModule[]> => await apiV2('ar'),
		save: async (ar: string, name: string) => await apiV2(`ar/add`, 'POST', { ar, name }),
		openDirectory: async () => await apiV2(`huds`, 'POST')
	},
	files: {
		imgToBase64: async (url: string) => {
			try {
				const response = await fetch(url);
				if (response.status !== 200) {
					return null;
				}
				const buffer = await response.arrayBuffer();
				return arrayBufferToBase64(buffer);
			} catch (e) {
				return null;
			}
		},
		sync: async (db: DB) => await apiV2<any>('import', 'POST', db),
		syncCheck: async (db: DB) => await apiV2<any>('import/verify', 'POST', db)
	},
	aco: {
		get: (): Promise<I.MapConfig[]> => apiV2('aco'),
		set: (config: I.MapConfig) => apiV2('aco', 'POST', config)
	},
	bakkesmod: {
		check: async () => await apiV2<I.BakkesModStatusResponse>('bakkesmod/check'),
		downloadMod: async () => await apiV2<I.BakkesModAPIResponse>('bakkesmod/download/mod'),
		downloadModData: async () => await apiV2<I.BakkesModAPIResponse>('bakkesmod/download/mod_data'),
		downloadSos: async () => await apiV2<I.BakkesModAPIResponse>('bakkesmod/download/sos'),
		installModData: async () => await apiV2<I.BakkesModAPIResponse>('bakkesmod/install/mod_data'),
		installSos: async () => await apiV2<I.BakkesModAPIResponse>('bakkesmod/install/sos'),
		run: async () => await apiV2<I.BakkesModAPIResponse>('bakkesmod/run')
	},
	f1: {
		get: () => apiV2<{ installed: boolean; configured: boolean }>('f1/status'),
		install: () => apiV2('f1/install', 'POST')
	}
};
