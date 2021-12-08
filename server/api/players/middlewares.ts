import express from 'express';
import db from './../../../init/database';
import { Player, AvailableGames, availableGames } from '../../../types/interfaces';
import { loadConfig, internalIP } from './../config';
import fetch from 'node-fetch';
import isSvg from './../../../src/isSvg';
import { getPlayersList, getPlayerById, getPlayerBySteamId, addPlayers } from './index';
import * as F from './../fields';
import { validateCloudAbility, customer } from '..';
import { addResource, updateResource, deleteResource, checkCloudStatus, updateLastDateLocallyOnly } from '../cloud';
import { Workbook } from 'exceljs';
import { getTeamsList } from '../teams';

const players = db.players;

export const getPlayers: express.RequestHandler = async (req, res) => {
	const game = customer.game;
	const $or: any[] = [{ game }];
	if (game === 'csgo') {
		$or.push({ game: { $exists: false } });
	}
	if (req.query.steamids && typeof req.query.steamids === 'string') {
		const steamids = req.query.steamids.split(';');
		const steamidOr = { $in: steamids };
		for (const $orVariant of $or) {
			$orVariant.steamid = steamidOr;
		}
	}

	const players = await getPlayersList({ $or });
	const config = await loadConfig();
	return res.json(
		players.map(player => ({
			...player,
			avatar:
				player.avatar && player.avatar.length
					? `http://${internalIP}:${config.port}/api/players/avatar/${player._id}`
					: null
		}))
	);
};
export const getPlayer: express.RequestHandler = async (req, res) => {
	if (!req.params.id) {
		return res.sendStatus(422);
	}

	const player = await getPlayerById(req.params.id);

	if (!player) {
		return res.sendStatus(404);
	}

	return res.json(player);
};
export const updatePlayer: express.RequestHandler = async (req, res) => {
	if (!req.params.id) {
		return res.sendStatus(422);
	}
	const player = await getPlayerById(req.params.id, true);
	if (!player) {
		return res.sendStatus(404);
	}

	const updated = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		username: req.body.username,
		avatar: req.body.avatar,
		game: customer.game,
		country: req.body.country,
		steamid: req.body.steamid,
		team: req.body.team,
		extra: req.body.extra
	} as Player;

	if (req.body.avatar === undefined) {
		updated.avatar = player.avatar;
	}

	let cloudStatus = false;
	if (await validateCloudAbility()) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}

	players.update({ _id: req.params.id }, { $set: updated }, {}, async err => {
		if (err) {
			return res.sendStatus(500);
		}
		if (cloudStatus) {
			await updateResource(customer.game as AvailableGames, 'players', { ...updated, _id: req.params.id });
		} else {
			updateLastDateLocallyOnly(customer.game, ['players']);
		}
		const player = await getPlayerById(req.params.id);
		return res.json(player);
	});
};
export const addPlayer: express.RequestHandler = async (req, res) => {
	let cloudStatus = false;
	if (await validateCloudAbility()) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}
	const newPlayer = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		username: req.body.username,
		avatar: req.body.avatar,
		country: req.body.country,
		steamid: req.body.steamid,
		team: req.body.team,
		extra: req.body.extra,
		game: customer.game
	} as Player;

	const result = await addPlayers([newPlayer]);
	if (!result || !result.length) {
		return res.sendStatus(500);
	}

	if (cloudStatus) {
		await addResource(customer.game as AvailableGames, 'players', result[0]);
	} else {
		updateLastDateLocallyOnly(customer.game, ['players']);
	}

	return res.json(result[0]);
};

export const addPlayersWithExcel: express.RequestHandler = async (req, res) => {
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

		const players: Player[] = [];

		const $or: any[] = [{ game }];
		if (game === 'csgo') {
			$or.push({ game: { $exists: false } });
		}

		const teams = await getTeamsList({ $or });

		worksheet.eachRow(row => {
			const username = row.getCell('A').value?.toString?.() || '';
			const steamid = row.getCell('B').value?.toString?.() || '';

			if (!username || username === 'Username' || !steamid) {
				return;
			}

			const firstName = row.getCell('C').value?.toString?.() || '';
			const lastName = row.getCell('D').value?.toString?.() || '';
			const country = row.getCell('E').value?.toString?.() || '';
			const teamName = row.getCell('F').value?.toString?.() || '';

			const team = teams.find(
				team => team.name === teamName && (team.game === game || (game === 'csgo' && !team.game))
			);

			const teamId = team?._id || '';

			players.push({
				username,
				steamid,
				firstName,
				lastName,
				country,
				team: teamId,
				extra: {},
				game,
				avatar: ''
			} as Player);
		});

		const result = await addPlayers(players);

		if (!result) {
			return res.sendStatus(503);
		}

		if (cloudStatus) {
			await addResource(customer.game as AvailableGames, 'players', result);
		} else {
			updateLastDateLocallyOnly(customer.game, ['players']);
		}

		return res.json({ message: `Added ${result.length} players` });
	} catch {
		return res.sendStatus(500);
	}
};

export const deletePlayer: express.RequestHandler = async (req, res) => {
	if (!req.params.id) {
		return res.sendStatus(422);
	}

	/*
	const player = await getPlayerById(req.params.id);
	if (!player) {
		return res.sendStatus(404);
	}
	*/

	const ids = req.params.id.split(';');

	let cloudStatus = false;
	if (await validateCloudAbility()) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}

	players.remove({ _id: { $in: ids } }, { multi: true }, async (err, n) => {
		if (err) {
			return res.sendStatus(500);
		}
		if (cloudStatus) {
			await deleteResource(customer.game as AvailableGames, 'players', ids);
		} else {
			updateLastDateLocallyOnly(customer.game, ['players']);
		}
		return res.sendStatus(n ? 200 : 404);
	});
};

export const getAvatarFile: express.RequestHandler = async (req, res) => {
	if (!req.params.id) {
		return res.sendStatus(422);
	}
	const team = await getPlayerById(req.params.id, true);
	if (!team || !team.avatar || !team.avatar.length) {
		return res.sendStatus(404);
	}

	const imgBuffer = Buffer.from(team.avatar, 'base64');

	res.writeHead(200, {
		'Content-Type': isSvg(imgBuffer) ? 'image/svg+xml' : 'image/png',
		'Content-Length': imgBuffer.length
	});
	res.end(imgBuffer);
};
export const getAvatarURLBySteamID: express.RequestHandler = async (req, res) => {
	if (!req.params.steamid) {
		return res.sendStatus(422);
	}
	const config = await loadConfig();
	const response = {
		custom: '',
		steam: ''
	};
	const player = await getPlayerBySteamId(req.params.steamid, true);
	if (player && player.avatar && player.avatar.length && player._id) {
		response.custom = `http://${internalIP}:${config.port}/api/players/avatar/${player._id}`;
	}
	try {
		if (config.steamApiKey.length === 0) {
			return res.json(response);
		}
		const re = await fetch(
			`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steamApiKey}&steamids=${req.params.steamid}`,
			{}
		).then(res => res.json());
		if (re.response && re.response.players && re.response.players[0] && re.response.players[0].avatarfull) {
			response.steam = re.response.players[0].avatarfull;
		}
	} catch {}
	return res.json(response);
};

export const getFields: express.RequestHandler = async (req, res) => {
	const fields = await F.getFields('players', customer.game as AvailableGames);
	return res.json(fields);
};

export const updateFields: express.RequestHandler = async (req, res) => {
	if (!req.body) {
		return res.sendStatus(422);
	}
	const newFields = await F.updateFields(req.body, 'players', customer.game as AvailableGames);
	return res.json(newFields);
};
