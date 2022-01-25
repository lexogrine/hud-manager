import express from 'express';
import { connectToARG, argSocket, sendARGStatus, sendConfigToARG } from './index';

export const setSafeband: express.RequestHandler = async (req, res) => {
	const { preTime, postTime } = req.body;

	if (argSocket) {
		argSocket.postTime = postTime;
		argSocket.preTime = preTime;
	}
	sendConfigToARG();

	return res.sendStatus(200);
};

export const setHLAE: express.RequestHandler = async (req, res) => {
	const { hlae } = req.body;

	if (argSocket) {
		argSocket.useHLAE = hlae;
	}

	await sendARGStatus();

	return res.sendStatus(200);
};

export const setOnline: express.RequestHandler = async (req, res) => {
	const { online } = req.body;

	if (argSocket) {
		argSocket.online = online;
	}

	return res.sendStatus(200);
};

export const setOrder: express.RequestHandler = async (req, res) => {
	const order = req.body;
	if (!order || !Array.isArray(order)) return res.sendStatus(422);
	if (argSocket) {
		argSocket.order = order;
		/*argSocket.socket?.send(
			'config',
			order.map(item => ({ id: item.id, active: item.active }))
		);

		argSocket.socket?.send('saveClips', argSocket.saveClips);*/
		sendConfigToARG();
	}
	return res.sendStatus(200);
};

export const getOrder: express.RequestHandler = async (req, res) => {
	return res.json(argSocket.order);
};

export const connect: express.RequestHandler = async (req, res) => {
	const id = req.body.id;
	if (!id || typeof id !== 'string' || argSocket.socket) {
		return res.sendStatus(422);
	}

	connectToARG(req.body.id);

	return res.sendStatus(200);
};

export const disconnect: express.RequestHandler = async (req, res) => {
	try {
		argSocket.socket?._socket.close();
	} catch {}

	return res.sendStatus(200);
};

export const requestARGStatus: express.RequestHandler = async (req, res) => {
	await sendARGStatus();
	return res.sendStatus(200);
};

export const saveDelay: express.RequestHandler = async (req, res) => {
	if (!req.body?.delay || typeof req.body.delay !== 'number') {
		return res.sendStatus(422);
	}

	argSocket.delay = req.body.delay;

	await sendARGStatus();
	return res.sendStatus(200);
};
export const saveClips: express.RequestHandler = async (req, res) => {
	if (!req.body || !('saveClips' in req.body)) {
		return res.sendStatus(422);
	}

	argSocket.saveClips = req.body.saveClips;
	sendConfigToARG();
	//argSocket?.socket?.send('saveClips', argSocket.saveClips);
	await sendARGStatus();
	return res.sendStatus(200);
};

export const saveConfig: express.RequestHandler = async (req, res) => {};
