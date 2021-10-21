import express, { RequestHandler, response } from 'express';
import { app } from 'electron';
import jwt from 'jsonwebtoken';
import nodeFetch, { RequestInit } from 'node-fetch';
import { publicKey } from './publickey';
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

const cookiePath = path.join(app.getPath('userData'), 'cookie.json');
const cookieJar = new CookieJar(new FileCookieStore(cookiePath));

export const fetch = fetchHandler(nodeFetch, cookieJar);

export let socket: SimpleWebSocket | null = null;

export const USE_LOCAL_BACKEND = false;

const domain = USE_LOCAL_BACKEND ? '192.168.50.40:5000' : 'hmapi.lexogrine.com';

let cameraSupportInit = false;

/*const initCameras = () => {
	if(cameraSupportInit) return;
	cameraSupportInit = true;

	ioPromise.then(io => {

	});
}*/

export const room: { uuid: string | null } = { uuid: null };

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

	if (room.uuid) socket.send('registerAsProxy', room.uuid);

	registerRoomSetup(socket);

	ioPromise.then(io => {
		socket?.on('hudsOnline', (hudsUUID: string[]) => {
			io.to('csgo').emit('hudsOnline', hudsUUID);
		});
		socket?.on('offerFromPlayer', (room: string, data: any, steamid: string, uuid: string) => {
			const targetSocket = socketMap[uuid];

			if (!targetSocket) return;

			targetSocket.emit('offerFromPlayer', room, data, steamid);
		});

		if (!cameraSupportInit) {
			cameraSupportInit = true;

			io.on('offerFromHUD', (room: string, data: any, steamid: string, uuid: string) => {
				socket?.send('offerFromHUD', room, data, steamid, uuid);
			});

			io.on('connection', ioSocket => {
				ioSocket.on('registerAsHUD', (room: string) => {
					const sockets = Object.values(socketMap);

					if (sockets.includes(ioSocket)) return;

					const uuid = uuidv4();

					socketMap[uuid] = ioSocket;

					ioSocket.on('disconnect',() => {
						socket?.send('unregisterAsHUD', room, uuid);
					});

					socket?.send('registerAsHUD', room, uuid);
				});

				ioSocket.on('offerFromHUD', (room: string, data: any, steamid: string) => {
					const sockets = Object.entries(socketMap);

					const targetSocket = sockets.find(entry => entry[1] === ioSocket);

					if (!targetSocket) return;

					socket?.send('offerFromHUD', room, data, steamid, targetSocket[0]);
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
	get: (machineId: string): Promise<{ token: string } | { error: string } | false> => api(`auth/${machineId}`),
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
		const result = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as I.Customer;
		if (result.user && result.license) {
			return result;
		}
		return false;
	} catch {
		return false;
	}
};

const loadUser = async (loggedIn = false) => {
	const machineId = getMachineId();
	const userToken = await userHandlers.get(machineId);

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
	return { success: true, message: '' };
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
	return await loadUser(true);
};

export const loginHandler: express.RequestHandler = async (req, res) => {
	const response = await login(req.body.username, req.body.password, req.body.token);
	res.json(response);
};

export const getCurrent: express.RequestHandler = async (req, res) => {
	if (customer.customer) {
		return res.json(customer.customer);
	}
	const response = await loadUser();

	if (customer.customer) {
		if ((customer.customer as any).license.type === 'professional') {
		}
		return res.json(customer.customer);
	}
	return res.status(403).json(response);
};
export const logout: express.RequestHandler = async (req, res) => {
	customer.customer = null;
	if (socket) {
		socket._socket.close();
	}
	await userHandlers.logout();
	return res.sendStatus(200);
};
