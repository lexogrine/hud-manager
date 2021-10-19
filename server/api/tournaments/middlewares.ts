import express from 'express';
import * as T from './';
import db from './../../../init/database';
import { getActiveGameMatches } from '../matches';
import { AvailableGames, Tournament } from '../../../types/interfaces';
import { validateCloudAbility, customer } from '..';
import { checkCloudStatus, addResource, updateResource, deleteResource, updateLastDateLocallyOnly } from '../cloud';

const tournamentsDb = db.tournaments;

export const getCurrentTournament: express.RequestHandler = async (req, res) => {
	const matches = await getActiveGameMatches();
	const current = matches.find(match => match.current);
	if (!current) {
		return res.json({ tournament: null });
	}

	const tournament = await T.getTournamentByMatchId(current.id);

	return res.json({ tournament: tournament || null });
};

export const getTournaments: express.RequestHandler = async (req, res) => {
	const tournaments = await T.getTournaments();
	return res.json(tournaments);
};

export const addTournament: express.RequestHandler = async (req, res) => {
	let cloudStatus = false;
	if (await validateCloudAbility('tournaments')) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}
	const {
		name,
		logo,
		playoffTeams,
		playoffType,
		groupType,
		groupTeams,
		phases,
		groupPhases,
		participants,
		groupParticipants
	} = req.body;
	const tournament = T.createTournament(
		playoffType,
		Number(playoffTeams),
		groupType,
		Number(groupTeams),
		Number(phases),
		Number(groupPhases),
		participants,
		groupParticipants
	);

	tournament.name = name;
	tournament.logo = logo;
	// @ts-ignore
	delete tournament._id;

	const tournamentWithId = await T.addTournament(tournament);
	if (cloudStatus) {
		await addResource(customer.game as AvailableGames, 'tournaments', tournamentWithId);
	} else {
		updateLastDateLocallyOnly(customer.game, ['tournaments']);
	}

	if (!tournamentWithId) return res.sendStatus(500);
	return res.json(tournamentWithId);
};

export const bindMatchToMatchup: express.RequestHandler = async (req, res) => {
	let cloudStatus = false;
	if (await validateCloudAbility('tournaments')) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}

	const tournamentId = req.params.id;
	const { matchId, matchupId } = req.body;
	const tournament = await T.bindMatch(matchId, matchupId, tournamentId);
	if (!tournament) return res.sendStatus(500);

	if (cloudStatus) {
		await updateResource(customer.game as AvailableGames, 'tournaments', tournament);
	} else {
		updateLastDateLocallyOnly(customer.game, ['tournaments']);
	}

	return res.sendStatus(200);
};

export const updateTournament: express.RequestHandler = async (req, res) => {
	const { name, logo } = req.body;
	const tournament = await T.getTournament(req.params.id);
	if (!tournament) return res.sendStatus(404);
	tournament.name = name;
	if (logo) {
		tournament.logo = logo;
	}
	let cloudStatus = false;
	if (await validateCloudAbility('tournaments')) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}
	const newTournament = await T.updateTournament(tournament);

	if (cloudStatus) {
		await updateResource(customer.game as AvailableGames, 'tournaments', { ...newTournament, _id: req.params.id });
	} else {
		updateLastDateLocallyOnly(customer.game, ['tournaments']);
	}
	return res.sendStatus(newTournament ? 200 : 500);
};

export const deleteTournament: express.RequestHandler = async (req, res) => {
	let cloudStatus = false;
	if (await validateCloudAbility('tournaments')) {
		cloudStatus = (await checkCloudStatus(customer.game as AvailableGames)) === 'ALL_SYNCED';
	}
	const del = await T.deleteTournament(req.params.id);
	if (cloudStatus) {
		await deleteResource(customer.game as AvailableGames, 'tournaments', req.params.id);
	} else {
		updateLastDateLocallyOnly(customer.game, ['tournaments']);
	}
	return res.sendStatus(del ? 200 : 500);
};

export const replaceLocalTournaments = (newTournaments: Tournament[], game: AvailableGames, existing: string[]) =>
	new Promise<boolean>(res => {
		const or: any[] = [
			{ game, _id: { $nin: existing } },
			{ game, _id: { $in: newTournaments.map(tournament => tournament._id) } }
		];
		if (game === 'csgo') {
			or.push(
				{ game: { $exists: false }, id: { $nin: existing } },
				{ game: { $exists: false }, id: { $in: newTournaments.map(tournament => tournament._id) } }
			);
		}
		tournamentsDb.remove({ $or: or }, { multi: true }, err => {
			if (err) {
				return res(false);
			}
			tournamentsDb.insert(newTournaments, (err, docs) => {
				return res(!err);
			});
		});
	});
