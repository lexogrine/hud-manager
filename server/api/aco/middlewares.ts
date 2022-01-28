import express from 'express';
import { customer } from '..';
import { getACOByMapName, getACOs, updateACO } from './index';

export const getACO: express.RequestHandler = async (req, res) => {
	const acos = await getACOs();
	return res.json(acos);
};

export const getACOByMap: express.RequestHandler = async (req, res) => {
	if (!req.params.mapName) {
		return res.sendStatus(422);
	}

	if (!customer.customer || (customer.customer.license.type === 'free' && !customer.workspace)) {
		return res.sendStatus(422);
	}

	const aco = await getACOByMapName(req.params.mapName);

	if (!aco) {
		return res.sendStatus(404);
	}

	return res.json(aco);
};

export const updateACOByMap: express.RequestHandler = async (req, res) => {
	const result = await updateACO(req.body);

	if (!result) {
		return res.sendStatus(500);
	}

	const aco = await getACOByMapName(req.params.mapName);
	return res.json(aco);
};
