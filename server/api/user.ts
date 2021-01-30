import express from 'express';
import { app } from 'electron';
import jwt from 'jsonwebtoken';
import nodeFetch from 'node-fetch';
import { publicKey } from './publickey';
import * as I from '../../types/interfaces';
import { customer } from './../api';
import { CookieJar } from 'tough-cookie';
import path from 'path';
import { FileCookieStore } from 'tough-cookie-file-store';
import fetchHandler from 'fetch-cookie';
import { getMachineId } from './machine';

const cookiePath = path.join(app.getPath('userData'), 'cookie.json');
const cookieJar = new CookieJar(new FileCookieStore(cookiePath));
const fetch = fetchHandler(nodeFetch, cookieJar);

const api = (url: string, method = 'GET', body?: any) => {
	const options: RequestInit = {
		method,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	};
	if (body) {
		options.body = JSON.stringify(body);
	}
	let data: any = null;
	return fetch(`https://hmapi.lexogrine.com/${url}`, options).then(res => {
		data = res;
		return res.json().catch(() => data && data.status < 300);
	});
};

const userHandlers = {
	get: (machineId: string): Promise<{ token: string } | { error: string } | false> => api(`auth/${machineId}`),
	login: (username: string, password: string, ver: string): Promise<{ status: number; message: string }> =>
		api('auth', 'POST', { username, password, ver }),
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
	if ('error' in userToken) {
		return { success: false, message: userToken.error };
	}
	const userData = verifyToken(userToken.token);
	if (!userData) {
		return { success: false, message: 'Your session has expired - try restarting the application' };
	}
	customer.customer = userData;
	return { success: true, message: '' };
};

const login = async (username: string, password: string) => {
	const ver = app.getVersion();

	const response = await userHandlers.login(username, password, ver);
	if (response.status === 404 || response.status === 401) {
		return { success: false, message: 'Incorrect username or password.' };
	}
	return await loadUser(true);
};

export const loginHandler: express.RequestHandler = async (req, res) => {
	const response = await login(req.body.username, req.body.password);
	res.json(response);
};

export const getCurrent: express.RequestHandler = async (req, res) => {
	if (customer.customer) {
		return res.json(customer.customer);
	}
	const response = await loadUser();
	return res.status(403).json(response);
};
export const logout: express.RequestHandler = async (req, res) => {
	customer.customer = null;
	await userHandlers.logout();
	return res.sendStatus(200);
};
