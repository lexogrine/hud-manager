import express, { RequestHandler, response } from 'express';
import { app } from 'electron';
import jwt from 'jsonwebtoken';
import nodeFetch, { RequestInit } from 'node-fetch';
import { publicKey } from './publickey';
import * as I from '../../types/interfaces';
import { customer } from './../api';
import { CookieJar } from 'tough-cookie';
import path from 'path';
import { FileCookieStore } from 'tough-cookie-file-store';
import fetchHandler from 'fetch-cookie';
import { getMachineId } from './machine';
import { SimpleWebSocket } from 'simple-websockets';
import { ioPromise } from '../socket';
import { checkCloudStatus } from './cloud';

const cookiePath = path.join(app.getPath('userData'), 'cookie.json');
const cookieJar = new CookieJar(new FileCookieStore(cookiePath));

export const fetch = fetchHandler(nodeFetch, cookieJar);

export let socket: SimpleWebSocket | null = null;

const USE_LOCAL_BACKEND = true;

const connectSocket = () => {
	if (socket) return;
	socket = new SimpleWebSocket(USE_LOCAL_BACKEND ? 'ws://localhost:5000' : 'wss://hmapi.lexogrine.com/', {
		headers: {
			Cookie: cookieJar.getCookieStringSync(
				USE_LOCAL_BACKEND ? 'http://localhost:5000/' : 'https://hmapi.lexogrine.com/'
			)
		}
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
	return fetch(
		USE_LOCAL_BACKEND ? `http://localhost:5000/${url}` : `https://hmapi.lexogrine.com/${url}`,
		options
	).then(res => {
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
