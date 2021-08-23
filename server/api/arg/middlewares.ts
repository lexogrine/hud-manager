import express from 'express';
import { connectToARG, argSocket, sendARGStatus } from './index';

export const connect: express.RequestHandler = async (req, res) => {
	const id = req.body.id;
	if(!id || typeof id !== "string" || argSocket.socket){
		return res.sendStatus(422);
	}

	connectToARG(req.body.id);

	return res.sendStatus(200);
};

export const disconnect: express.RequestHandler = async (req, res) => {
	try {
		argSocket.socket?._socket.close();
	} catch {

	}

	return res.sendStatus(200);
};

export const requestARGStatus: express.RequestHandler = async (req, res) => {
	await sendARGStatus();
	return res.sendStatus(200);
};

export const saveDelay: express.RequestHandler = async (req, res) => {
	if(!req.body?.delay || typeof req.body.delay !== "number") {
		return res.sendStatus(422);
	}

	argSocket.delay = req.body.delay;
	await sendARGStatus();
	return res.sendStatus(200);
}