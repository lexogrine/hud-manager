import { CustomFieldEntry } from '../../types/interfaces';
import config from './config';
import * as I from './interfaces';
const apiUrl = config.apiAddress;
interface DB {
	teams: I.Team[];
	players: I.Player[];
}
function arrayBufferToBase64(buffer: any) {
	let binary = '';
	const bytes = [].slice.call(new Uint8Array(buffer));

	bytes.forEach(b => (binary += String.fromCharCode(b)));

	return window.btoa(binary);
}

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
		delete: async (id: string) => await apiV2(`players/${id}`, 'DELETE'),
		getAvatar: async (id: string) => {
			fetch(`${apiUrl}api/players/avatar/${id}`);
		},
		fields: {
			get: () => apiV2<CustomFieldEntry[]>('players/fields'),
			update: (fields: CustomFieldEntry[]) => apiV2<CustomFieldEntry[]>('players/fields', 'PATCH', fields)
		}
	},
	teams: {
		get: async () => apiV2<I.Team[]>('teams'),
		add: async (team: any) => await apiV2('teams', 'POST', team),
		update: async (id: string, team: any) => await apiV2(`teams/${id}`, 'PATCH', team),
		delete: async (id: string) => await apiV2(`teams/${id}`, 'DELETE'),
		getLogo: async (id: string) => {
			const response = await fetch(`${apiUrl}api/teams/logo/${id}`);
			return response;
		},
		fields: {
			get: () => apiV2<CustomFieldEntry[]>('teams/fields'),
			update: (fields: CustomFieldEntry[]) => apiV2<CustomFieldEntry[]>('teams/fields', 'PATCH', fields)
		}
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
		getVersion: (): Promise<{ version: string }> => apiV2('version')
	},
	cfgs: {
		check: async (): Promise<I.CFGGSIResponse> => await apiV2('cfg'),
		create: async (): Promise<I.CFGGSIResponse> => await apiV2('cfg', 'PUT')
	},
	gamestate: {
		check: async (): Promise<I.CFGGSIResponse> => await apiV2('gsi'),
		create: async (): Promise<I.CFGGSIResponse> => await apiV2('gsi', 'PUT')
	},
	game: {
		run: async (config: { radar: boolean; killfeed: boolean; afx: boolean; autoexec: boolean }) =>
			await apiV2(`game/run`, 'POST', config),
		runTest: () => apiV2('test', 'POST'),
		toggleLoop: () => apiV2('test/loop', 'POST')
	},
	huds: {
		get: async (): Promise<I.HUD[]> => await apiV2('huds'),
		start: async (hudDir: string) => await apiV2(`huds/${hudDir}/start`, 'POST'),
		close: async (hudDir: string) => await apiV2(`huds/${hudDir}/close`, 'POST'),
		openDirectory: async () => await apiV2(`huds`, 'POST'),
		upload: async (hud: string, name: string) => await apiV2(`huds/add`, 'POST', { hud, name }),
		delete: async (hudDir: string) => await apiV2(`huds?hudDir=${hudDir}`, 'DELETE')
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
		add: (tournament: { name: string; logo: string; teams: number; type: string }): Promise<I.Tournament> =>
			apiV2('tournaments', 'POST', tournament),
		bind: (tournamentId: string, matchId: string, matchupId: string) =>
			apiV2(`tournaments/${tournamentId}`, 'POST', { matchId, matchupId }),
		delete: (tournamentId: string) => apiV2(`tournaments/${tournamentId}`, 'DELETE'),
		update: (tournamentId: string, data: { name: string; logo: string }) =>
			apiV2(`tournaments/${tournamentId}`, 'PATCH', data)
	},
	user: {
		login: (username: string, password: string): Promise<any> => apiV2('auth', 'POST', { username, password }),
		logout: () => apiV2('auth', 'DELETE'),
		getCurrent: (): Promise<I.Customer | { message: string; success: boolean }> => apiV2('auth')
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
	}
};
