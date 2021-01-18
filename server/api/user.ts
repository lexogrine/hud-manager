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

const cookiePath = path.join(app.getPath('userData'), 'cookie.json');
const cookieJar = new CookieJar(new FileCookieStore(cookiePath));
const fetch = fetchHandler(nodeFetch, cookieJar);

const api = (url: string, method = 'GET', body?: any, credentials?: boolean) => {
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
	return fetch(`https://hmapi.lexogrine.com/${url}`, options).then(res => {
		data = res;
		return res.json().catch(() => data && data.status < 300);
	});
};
/*
const get = (machineId: string): Promise<{ token: string } | { error: string } | false> => api(`auth/${machineId}`);
const login = (username: string, password: string, ver: string): Promise<any> => api('auth', 'POST', { username, password, ver });
const logouts = (): Promise<any> => api('auth', 'DELETE');

*/

const verifToken = (token: string) => {
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

const login = async (email: string, password: string, ver: string, machineId: string) => {
	const response = await api('auth', 'POST', { username: email, password, ver });
	if (!response) {
		return { success: false, message: '' };
	}
	const userToken = await api(`auth/${machineId}`);
	if (!userToken) {
		return { success: false, message: '' };
	}
	if ('error' in userToken) {
		return { success: false, message: userToken.error };
	}
	const userData = verifToken(userToken.token);
	if (!userData) {
		return { success: false, message: '' };
	}
	customer.customer = userData;
	return { success: true, message: '' };
};

export const verifyToken: express.RequestHandler = async (req, res) => {
	if (!req.body || !req.body.token) return res.sendStatus(422);
	const tokenResult = verifToken(req.body.token);
	if (!tokenResult) {
		return res.sendStatus(403);
	}
	customer.customer = tokenResult;
	return res.json(tokenResult);
};

export const getCurrent: express.RequestHandler = async (req, res) => {
	if (customer.customer) {
		return res.json(customer.customer);
	}
	return res.sendStatus(403);
};
export const logout: express.RequestHandler = async (req, res) => {
	customer.customer = null;
	return res.sendStatus(200);
};
