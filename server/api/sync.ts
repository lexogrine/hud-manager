import * as I from './../../types/interfaces';
import db from './../../init/database';
import express from 'express';
import * as players from './players';
import * as teams from './teams';

const { teams: teamsDb, players: playersDb } = db;
interface DB {
	teams: I.Team[];
	players: I.Player[];
}
async function importPlayers(players: I.Player[]) {
	return new Promise<I.Player[]>(res => {
		const playerIdList = players.map(player => ({ _id: player._id }));
		playersDb.remove({ $or: playerIdList }, { multi: true }, err => {
			if (err) return res([]);
			playersDb.insert(players, (err, newDocs) => {
				if (err) return res([]);
				return res(newDocs);
			});
		});
	});
}
async function importTeams(teams: I.Team[]) {
	return new Promise<I.Team[]>(res => {
		const teamIdList = teams.map(team => ({ _id: team._id }));
		teamsDb.remove({ $or: teamIdList }, { multi: true }, err => {
			if (err) return res([]);
			teamsDb.insert(teams, (err, newDocs) => {
				if (err) return res([]);
				return res(newDocs);
			});
		});
	});
}

export async function exportDatabase() {
	const pl = new Promise<I.Player[]>(res => {
		playersDb.find({}, (err, players) => {
			if (err) {
				return res([]);
			}
			return res(players);
		});
	});
	const tm = new Promise<I.Team[]>(res => {
		teamsDb.find({}, (err, teams) => {
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
