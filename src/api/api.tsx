import config from './config';
import * as I from './interfaces';
const apiUrl = config.apiAddress;

export async function apiV2(url: string, method = 'GET', body?: any){
    const options: RequestInit = {
        method,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    }
    if(body){
        options.body = JSON.stringify(body)
    }
    let data: any = null;
    return fetch(`${apiUrl}api/${url}`, options)
            .then(res => {
                data = res;
                return res.json().catch(_e => data && data.status < 300)
            });
}

export default {
    players: {
        get: async (): Promise<I.Player[]> => await apiV2('players'),
        add: async (player: any) => await apiV2('players', 'POST', player),
        update: async (id: string, player: any) => await apiV2(`players/${id}`, 'PATCH', player),
        delete: async (id: string) => await apiV2(`players/${id}`, 'DELETE')
    },
    teams: {
        get: async (): Promise<I.Team[]> => await apiV2('teams'),
        add: async (team: any) => await apiV2('teams', 'POST', team),
        update: async (id: string, team: any) => await apiV2(`teams/${id}`, 'PATCH', team),
        delete: async (id: string) => await apiV2(`teams/${id}`, 'DELETE')
    },
    config: {
        get: async (): Promise<I.Config> => await apiV2('config'),
        update: async (config: I.Config) => await apiV2('config', 'PATCH', config)
    }
}