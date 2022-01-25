import express, { RequestHandler, response } from 'express';
import { app } from 'electron';
import jwt from 'jsonwebtoken';
import nodeFetch, { RequestInit } from 'node-fetch';
import { publicKey } from './publickey';
import fs from 'fs';
import * as I from '../../types/interfaces';
import { customer, registerRoomSetup } from './../api';
import { CookieJar } from 'tough-cookie';
import path from 'path';
import { Socket } from 'socket.io';
import { FileCookieStore } from 'tough-cookie-file-store';
import fetchHandler from 'fetch-cookie';
import { getMachineId } from './machine';
import { SimpleWebSocket } from 'simple-websockets';
import { ioPromise } from '../socket';
import { checkCloudStatus } from './cloud';
import { v4 as uuidv4 } from 'uuid';
import { loadUsersDatabase } from '../../init/database';

const cookiePath = path.join(app.getPath('userData'), 'cookie.json');
const cookieJar = new CookieJar(new FileCookieStore(cookiePath));

export const fetch = fetchHandler(nodeFetch, cookieJar);

export let socket: SimpleWebSocket | null = null;

export const USE_LOCAL_BACKEND = true;

const domain = USE_LOCAL_BACKEND ? 'localhost:5000' : 'api.lhm.gg';

let cameraSupportInit = false;

const getSocket = () => {
	return socket;
};

/*const initCameras = () => {
	if(cameraSupportInit) return;
	cameraSupportInit = true;

	ioPromise.then(io => {

	});
}*/

let connectedSteamids: string[] = [];

export const room: { uuid: string | null; availablePlayers: I.CameraRoomPlayer[]; password: string } = {
	uuid: null,
	availablePlayers: [],
	password: ''
};

const socketMap: Record<string, Socket> = {};

setInterval(() => {
	if (!socket) return;

	socket.send('ping');
}, 45000);

const connectSocket = () => {
	if (!room.uuid) {
		room.uuid = uuidv4();
		console.log('CAMERA ROOM:', room.uuid);
	}
	if (socket) return;
	socket = new SimpleWebSocket(USE_LOCAL_BACKEND ? `ws://${domain}` : `wss://${domain}/`, {
		headers: {
			Cookie: cookieJar.getCookieStringSync(USE_LOCAL_BACKEND ? `http://${domain}/` : `https://${domain}/`)
		}
	});

	socket.on('connection', () => {
		if (room.uuid) socket?.send('registerAsProxy', room.uuid);
	});

	socket._socket.onerror = (err: any) => {
		console.log(err);
	};

	socket.on('banned', () => {
		ioPromise.then(io => {
			io.emit('banned');
		});
	});
	socket.on('db_update', async () => {
		if (!customer.game) return;
		const io = await ioPromise;
		const result = await checkCloudStatus(customer.game);
		if (result !== 'ALL_SYNCED') {
			// TODO: Handle that
			return;
		}
		io.emit('db_update');
	});
	socket.on('disconnect', () => {
		socket = null;
		setTimeout(connectSocket, 2000);
	});

	registerRoomSetup(socket);

	ioPromise.then(io => {
		socket?.on('hudsOnline', (hudsUUID: string[]) => {
			io.to('csgo').emit('hudsOnline', hudsUUID);
		});
		socket?.on('offerFromPlayer', (roomId: string, data: any, steamid: string, uuid: string) => {
			if (!room.availablePlayers.find(player => player.steamid === steamid)) {
				return;
			}
			const targetSocket = socketMap[uuid];

			if (!targetSocket) return;

			targetSocket.emit('offerFromPlayer', roomId, data, steamid);
		});

		socket?.on('playersOnline', (data: string[]) => {
			connectedSteamids = data;
			io.emit('playersOnline', data);
		});

		socket?.send('getConnectedPlayers');

		if (!cameraSupportInit) {
			cameraSupportInit = true;

			io.on('offerFromHUD', (room: string, data: any, steamid: string, uuid: string) => {
				getSocket()?.send('offerFromHUD', room, data, steamid, uuid);
			});

			io.on('connection', ioSocket => {
				ioSocket.on('registerAsHUD', (room: string) => {
					const sockets = Object.values(socketMap);

					if (sockets.includes(ioSocket)) return;

					const uuid = uuidv4();

					socketMap[uuid] = ioSocket;

					ioSocket.on('disconnect', () => {
						getSocket()?.send('unregisterAsHUD', room, uuid);
					});

					getSocket()?.send('registerAsHUD', room, uuid);
				});

				ioSocket.on('getConnectedPlayers', () => {
					ioSocket.emit('playersOnline', connectedSteamids);
				});

				ioSocket.on('offerFromHUD', (room: string, data: any, steamid: string) => {
					const sockets = Object.entries(socketMap);

					const targetSocket = sockets.find(entry => entry[1] === ioSocket);

					if (!targetSocket) return;

					getSocket()?.send('offerFromHUD', room, data, steamid, targetSocket[0]);
				});

				ioSocket.on('disconnect', () => {
					const sockets = Object.entries(socketMap);

					const targetSocket = sockets.find(entry => entry[1] === ioSocket);

					if (!targetSocket) return;

					delete socketMap[targetSocket[0]];
				});
			});
		}
	});
};
export const verifyGame: RequestHandler = (req, res, next) => {
	if (!customer.game) {
		return res.sendStatus(403);
	}
	return next();
};

export const api = (url: string, method = 'GET', body?: any, opts?: RequestInit) => {
	const options: RequestInit = opts || {
		method,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}
	};
	if (body) {
		options.body = JSON.stringify(body);
	}
	let data: any = null;
	return fetch(USE_LOCAL_BACKEND ? `http://${domain}/${url}` : `https://${domain}/${url}`, options).then(res => {
		data = res;
		return res.json().catch(() => data && data.status < 300);
	});
};

const userHandlers = {
	get: (machineId: string, workspaceId: number | null): Promise<{ token: string } | { error: string } | false> =>
		api(workspaceId ? `auth/${machineId}?teamId=${workspaceId}` : `auth/${machineId}`),
	getWorkspaces: (): Promise<{ error: string } | I.Workspace[]> => api(`auth/workspaces`),
	login: (
		username: string,
		password: string,
		ver: string,
		code: string
	): Promise<{ status: number; message: string }> => api('auth', 'POST', { username, password, ver, code }),
	logout: () => api('auth', 'DELETE')
};

const verifyToken = (token: string) => {
	try {
		const result = jwt.decode(token /*publicKey,*/) as unknown as I.Customer;
		//jwt.decode()
		if (result.user && result.license) {
			return result;
		}
		return false;
	} catch {
		return false;
	}
};

const loadUser = async (workspace: I.Workspace | null, loggedIn = false) => {
	const machineId = getMachineId();

	const userToken = await userHandlers.get(machineId, workspace?.id || null);

	if (!userToken) {
		return { success: false, message: loggedIn ? 'Your session has expired - try restarting the application' : '' };
	}
	if (typeof userToken !== 'boolean' && 'error' in userToken) {
		return { success: false, message: userToken.error };
	}
	const userData = verifyToken(userToken.token);
	if (!userData) {
		return { success: false, message: 'Your session has expired - try restarting the application' };
	}

	connectSocket();

	customer.customer = userData;
	customer.workspace = workspace;

	await loadUsersDatabase(customer);

	return { success: true, message: '' };
};

const loadUserWorkspaces = async () => {
	const response = await userHandlers.getWorkspaces();
	if (!response || 'error' in response) {
		if (!response) {
			return { error: 'Not logged in' };
		}
		return response;
	}

	customer.workspaces = response;

	return response;
};

const login = async (username: string, password: string, code = '') => {
	const ver = app.getVersion();

	const response = await userHandlers.login(username, password, ver, code);
	if (response.status === 404 || response.status === 401) {
		return { success: false, message: 'Incorrect username or password.' };
	}
	if (typeof response !== 'boolean' && 'error' in response) {
		return { success: false, message: (response as any).error };
	}

	const workspaces = await loadUserWorkspaces();

	return { success: !('error' in workspaces) };
};

export const loginHandler: express.RequestHandler = async (req, res) => {
	const response = await login(req.body.username, req.body.password, req.body.token);
	res.json(response);
};

export const getWorkspaces: express.RequestHandler = async (req, res) => {
	return res.json({ result: customer.workspaces });
};

export const setWorkspace: express.RequestHandler = async (req, res) => {
	const { workspaceId } = req.body;

	if (!customer.workspaces) {
		return res.status(403).json({ success: false, message: 'No workspaces' });
	}

	if (workspaceId === null) {
		const result = await loadUser(workspaceId, true);

		return res.json(result);
	}

	const targetWorkspace = customer.workspaces.find(workspace => workspace.id === workspaceId);

	if (!targetWorkspace) {
		return res.status(403).json({ success: false, message: 'Bad workspace' });
	}
	const result = await loadUser(targetWorkspace, true);

	return res.json(result);
};

export const getCurrent: express.RequestHandler = async (req, res) => {
	if (customer.customer) {
		return res.json(customer);
	}

	const workspaces = customer.workspaces || (await loadUserWorkspaces());

	if ('error' in workspaces) {
		return res.status(403).json({ success: false, message: workspaces.error });
	}
	if (workspaces.length > 0) {
		return res.json(customer);
	}

	const result = await loadUser(null, true);

	if (result.success) {
		return res.json(customer);
	}

	return res.json(result);
};
export const logout: express.RequestHandler = async (req, res) => {
	customer.customer = null;
	customer.workspaces = null;
	customer.workspace = null;
	await loadUserWorkspaces();
	if (socket) {
		socket._socket.close();
	}
	await userHandlers.logout();
	return res.sendStatus(200);
};

export const setNewRoomUUID: express.RequestHandler = async (req, res) => {
	if (!socket) {
		return res.sendStatus(500);
	}
	room.uuid = uuidv4();
	await registerRoomSetup(socket);
	setTimeout(() => {
		sendPlayersToRoom({ players: room.availablePlayers, password: '' });
		res.sendStatus(200);
	}, 500);
};

export const sendPlayersToRoom = async (input: { players: any; password: string }, statusToggling = false) => {
	if (
		!Array.isArray(input.players) ||
		!input.players.every(
			x => typeof x === 'object' && x && typeof x.steamid === 'string' && typeof x.label === 'string'
		)
	) {
		return false;
	}
	const io = await ioPromise;

	room.availablePlayers = input.players;
	room.password = input.password;

	if (statusToggling) {
		io.to('game').emit('playersCameraStatus', room.availablePlayers);
	}

	setTimeout(() => {
		fetch(`${USE_LOCAL_BACKEND ? `http://${domain}` : `https://${domain}`}/cameras/setup/${room.uuid}`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ players: [...room.availablePlayers], password: room.password })
		})
			.then(res => res.text())
			.then(value => {
				fs.writeFileSync(
					path.join(app.getPath('userData'), 'errors', `${new Date().getTime()}.txt`),
					`Trying to update ${room.uuid} with ${JSON.stringify([
						...room.availablePlayers
					])}. Response: ${value}`
				);
			})
			.catch(reason => {
				fs.writeFileSync(path.join(app.getPath('userData'), 'errors', `${new Date().getTime()}.txt`), reason);
			});
	}, 1000);
	return true;
};
