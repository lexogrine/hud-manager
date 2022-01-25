import express from 'express';
import { databaseContext } from './../../../init/database';
import { Team, AvailableGames, availableGames } from '../../../types/interfaces';
import { loadConfig, internalIP } from './../config';
import isSvg from './../../../src/isSvg';
import { getTeamsList, getTeamById, addTeams } from './index';
import * as F from './../fields';
import { validateCloudAbility, customer } from '..';
import { addResource, updateResource, deleteResource, checkCloudStatus, updateLastDateLocallyOnly } from '../cloud';
import { Workbook } from 'exceljs';


export const getTeams: express.RequestHandler = async (req, res) => {
	const game = customer.game;
	const $or: any[] = [{ game }];
	if (game === 'csgo') {
		$or.push({ game: { $exists: false } });
	}
	const teams = await getTeamsList({ $or });
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

	const config = await loadConfig();

	return res.json({
		...team,
		logo: team.logo && team.logo.length ? `http://${internalIP}:${config.port}/api/teams/logo/${team._id}` : null
	});
};
export const addTeam: express.RequestHandler = async (req, res) => {
	let cloudStatus = false;
	if (await validateCloudAbility()) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}
	const newTeam = {
		name: req.body.name,
		shortName: req.body.shortName,
		logo: req.body.logo,
		country: req.body.country,
		game: customer.game,
		extra: req.body.extra
	} as Team;

	const result = await addTeams([newTeam]);

	if (!result || !result.length) {
		return res.sendStatus(500);
	}

	if (cloudStatus) {
		await addResource(customer.game as AvailableGames, 'teams', result[0]);
	} else {
		updateLastDateLocallyOnly(customer.game, ['teams']);
	}

	return res.json(result[0]);
};

export const addTeamsWithExcel: express.RequestHandler = async (req, res) => {
	const fileBase64 = req.body.data as string;
	const game = customer.game as AvailableGames;

	if (!availableGames.includes(game)) return res.sendStatus(422);

	let cloudStatus = false;
	if (await validateCloudAbility()) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}

	const file = Buffer.from(fileBase64, 'base64');
	try {
		const workbook = new Workbook();
		await workbook.xlsx.load(file);

		const worksheet = workbook.worksheets[0];

		if (!worksheet) return res.sendStatus(422);

		const teams: Team[] = [];

		worksheet.eachRow(row => {
			const name = row.getCell('A').value?.toString?.();

			if (!name || name === 'Team name') {
				return;
			}

			const shortName = row.getCell('B').value?.toString?.();
			const country = row.getCell('C').value?.toString?.();

			teams.push({
				name,
				shortName,
				country,
				logo: '',
				game,
				extra: {}
			} as Team);
		});

		const result = await addTeams(teams);

		if (!result) {
			return res.sendStatus(503);
		}

		if (cloudStatus) {
			await addResource(customer.game as AvailableGames, 'teams', result);
		} else {
			updateLastDateLocallyOnly(customer.game, ['teams']);
		}

		return res.json({ message: `Added ${result.length} teams` });
	} catch {
		return res.sendStatus(500);
	}
};

export const updateTeam: express.RequestHandler = async (req, res) => {
	if(!databaseContext.databases.teams){
		return res.sendStatus(500);
	}
	if (!req.params.id) {
		return res.sendStatus(422);
	}
	const team = await getTeamById(req.params.id, true);
	if (!team) {
		return res.sendStatus(404);
	}

	let cloudStatus = false;
	if (await validateCloudAbility()) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}

	const updated = {
		name: req.body.name,
		shortName: req.body.shortName,
		logo: req.body.logo,
		game: customer.game,
		country: req.body.country,
		extra: req.body.extra
	} as Team;

	if (req.body.logo === undefined) {
		updated.logo = team.logo;
	}

	databaseContext.databases.teams.update({ _id: req.params.id }, { $set: updated }, {}, async err => {
		if (err) {
			return res.sendStatus(500);
		}

		if (cloudStatus) {
			await updateResource(customer.game as AvailableGames, 'teams', { ...updated, _id: req.params.id });
		} else {
			updateLastDateLocallyOnly(customer.game, ['teams']);
		}
		const team = await getTeamById(req.params.id);
		return res.json(team);
	});
};
export const deleteTeam: express.RequestHandler = async (req, res) => {
	if(!databaseContext.databases.teams){
		return res.sendStatus(500);
	}
	if (!req.params.id) {
		return res.sendStatus(422);
	}

	/*
	const team = await getTeamById(req.params.id);
	if (!team) {
		return res.sendStatus(404);
	}
	*/

	const ids = req.params.id.split(';');

	let cloudStatus = false;
	if (await validateCloudAbility()) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}
	//players.update({team:})
	databaseContext.databases.teams.remove({ _id: { $in: ids } }, { multi: true }, async (err, n) => {
		if (err) {
			return res.sendStatus(500);
		}
		if (cloudStatus) {
			await deleteResource(customer.game as AvailableGames, 'teams', ids);
		} else {
			updateLastDateLocallyOnly(customer.game, ['teams']);
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
	const fields = await F.getFields('teams', customer.game as AvailableGames);
	return res.json(fields);
};

export const updateFields: express.RequestHandler = async (req, res) => {
	if (!req.body) {
		return res.sendStatus(422);
	}
	const newFields = await F.updateFields(req.body, 'teams', customer.game as AvailableGames);
	return res.json(newFields);
};
