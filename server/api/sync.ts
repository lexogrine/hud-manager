import * as I from './../../types/interfaces';
import { databaseContext } from './../../init/database';
import express from 'express';
import * as players from './players';
import * as teams from './teams';

const { teams: teamsDb, players: playersDb } = databaseContext.databases;
interface DB {
	teams: I.Team[];
	players: I.Player[];
}

async function importPlayers(players: I.Player[]) {
	return new Promise<I.Player[]>(res => {
		if(!databaseContext.databases.players) return res([]);
		const playerIdList = players.map(player => ({ _id: player._id }));
		databaseContext.databases.players.remove({ $or: playerIdList }, { multi: true }, err => {
			if (err) return res([]);
			databaseContext.databases.players.insert(players, (err, newDocs) => {
				if (err) return res([]);
				return res(newDocs);
			});
		});
	});
}
async function importTeams(teams: I.Team[]) {
	return new Promise<I.Team[]>(res => {
		if(!databaseContext.databases.teams) return res([]);
		const teamIdList = teams.map(team => ({ _id: team._id }));
		databaseContext.databases.teams.remove({ $or: teamIdList }, { multi: true }, err => {
			if (err) return res([]);
			databaseContext.databases.teams.insert(teams, (err, newDocs) => {
				if (err) return res([]);
				return res(newDocs);
			});
		});
	});
}

export async function exportDatabase() {
	const pl = new Promise<I.Player[]>(res => {
		if(!databaseContext.databases.players) return res([]);
		databaseContext.databases.players.find({}, (err: any, players: I.Player[]) => {
			if (err) {
				return res([]);
			}
			return res(players);
		});
	});
	const tm = new Promise<I.Team[]>(res => {
		if(!databaseContext.databases.teams) return res([]);
		databaseContext.databases.teams.find({}, (err: any, teams: I.Team[]) => {
			if (err) {
				return res([]);
			}
			return res(teams);
		});
	});

	const result = await Promise.all([pl, tm]);

	const response: DB = {
		teams: result[1],
		players: result[0]
	};
	return JSON.stringify(response);
}

export const importDb: express.RequestHandler = async (req, res) => {
	const db = req.body as DB;
	if (!db || !db.players || !db.teams) return res.sendStatus(422);
	try {
		await Promise.all([importPlayers(db.players), importTeams(db.teams)]);
		return res.sendStatus(200);
	} catch {
		return res.sendStatus(500);
	}
};

export const checkForConflicts: express.RequestHandler = async (req, res) => {
	const db = req.body as DB;
	if (!db || !db.teams || !db.players) return res.sendStatus(422);
	const teamIdList = db.teams.map(team => ({ _id: team._id }));
	const playerIdList = db.players.map(player => ({ _id: player._id }));
	try {
		const result = await Promise.all([
			players.getPlayersList({ $or: playerIdList }),
			teams.getTeamsList({ $or: teamIdList })
		]);
		return res.json({
			players: result[0].length,
			teams: result[1].length
		});
	} catch {
		return res.sendStatus(500);
	}
};
