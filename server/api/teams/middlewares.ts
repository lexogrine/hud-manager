import express from 'express';
import db from './../../../init/database';
import { Team, AvailableGames } from '../../../types/interfaces';
import { loadConfig, internalIP } from './../config';
import isSvg from './../../../src/isSvg';
import { getTeamsList, getTeamById } from './index';
import * as F from './../fields';
import { validateCloudAbility, customer } from '..';
import { addResource, updateResource, deleteResource } from '../cloud';

const teams = db.teams;
const players = db.players;

export const getTeams: express.RequestHandler = async (req, res) => {
	const teams = await getTeamsList({});
	const config = await loadConfig();
	return res.json(
		teams.map(team => ({
			...team,
			logo:
				team.logo && team.logo.length ? `http://${internalIP}:${config.port}/api/teams/logo/${team._id}` : null
		}))
	);
};

export const getTeam: express.RequestHandler = async (req, res) => {
	if (!req.params.id) {
		return res.sendStatus(422);
	}

	const team = await getTeamById(req.params.id, true);

	if (!team) {
		return res.sendStatus(404);
	}

	return res.json(team);
};
export const addTeam: express.RequestHandler = (req, res) => {
	const newTeam = {
		name: req.body.name,
		shortName: req.body.shortName,
		logo: req.body.logo,
		country: req.body.country,
		game: req.body.game,
		extra: req.body.extra
	} as Team;
	teams.insert(newTeam, async (err, team) => {
		if (err) {
			return res.sendStatus(500);
		}
		if (validateCloudAbility()) {
			await addResource(customer.game as AvailableGames, 'teams', team);
		}
		return res.json(team);
	});
};
export const updateTeam: express.RequestHandler = async (req, res) => {
	if (!req.params.id) {
		return res.sendStatus(422);
	}
	const team = await getTeamById(req.params.id, true);
	if (!team) {
		return res.sendStatus(404);
	}

	const updated = {
		name: req.body.name,
		shortName: req.body.shortName,
		logo: req.body.logo,
		game: req.body.game,
		country: req.body.country,
		extra: req.body.extra
	} as Team;

	if (req.body.logo === undefined) {
		updated.logo = team.logo;
	}

	teams.update({ _id: req.params.id }, { $set: updated }, {}, async err => {
		if (err) {
			return res.sendStatus(500);
		}

		if (validateCloudAbility()) {
			await updateResource(customer.game as AvailableGames, 'teams', { ...updated, _id: req.params.id });
		}
		const team = await getTeamById(req.params.id);
		return res.json(team);
	});
};
export const deleteTeam: express.RequestHandler = async (req, res) => {
	if (!req.params.id) {
		return res.sendStatus(422);
	}
	const team = await getTeamById(req.params.id);
	if (!team) {
		return res.sendStatus(404);
	}
	//players.update({team:})
	teams.remove({ _id: req.params.id }, async (err, n) => {
		if (err) {
			return res.sendStatus(500);
		}
		if (validateCloudAbility()) {
			await deleteResource(customer.game as AvailableGames, 'teams', req.params.id);
		}
		return res.sendStatus(n ? 200 : 404);
	});
};

export const getLogoFile: express.RequestHandler = async (req, res) => {
	if (!req.params.id) {
		return res.sendStatus(422);
	}
	const team = await getTeamById(req.params.id, true);
	if (!team || !team.logo || !team.logo.length) {
		return res.sendStatus(404);
	}
	const imgBuffer = Buffer.from(team.logo, 'base64');
	res.writeHead(200, {
		'Content-Type': isSvg(imgBuffer) ? 'image/svg+xml' : 'image/png',
		'Content-Length': imgBuffer.length
	});
	res.end(imgBuffer);
};

export const getFields: express.RequestHandler = async (req, res) => {
	const fields = await F.getFields('teams');
	return res.json(fields);
};

export const updateFields: express.RequestHandler = async (req, res) => {
	if (!req.body) {
		return res.sendStatus(422);
	}
	const newFields = await F.updateFields(req.body, 'teams');
	return res.json(newFields);
};
