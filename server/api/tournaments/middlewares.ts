import express from 'express';
import * as T from './'

export const getTournaments: express.RequestHandler = async (req, res) => {
    const tournaments = await T.getTournaments();
    return res.json(tournaments);
}

export const addTournament: express.RequestHandler = async (req, res) => {
    const { name, logo, teams, type } = req.body;
    const tournament = T.createTournament(type, teams);
    
    tournament.name = name;
    tournament.logo = logo;

    delete tournament._id;

    const tournamentWithId = await T.addTournament(tournament);

    if(!tournamentWithId) return res.sendStatus(500);
    return res.json(tournamentWithId);
}

export const bindMatchToMatchup: express.RequestHandler = async (req, res) => {
    const tournamentId = req.params.id;
    const { matchId, matchupId } = req.body;
    const tournament = await T.bindMatch(matchId, matchupId, tournamentId);
    if (!tournament) return res.sendStatus(500);
    return res.sendStatus(200);
}

export const updateTournament: express.RequestHandler = async (req, res) => {
    const { name, logo } = req.body;
    const tournament = await T.getTournament(req.params.id);
    if(!tournament) return res.sendStatus(404);
    tournament.name = name;
    if(logo) {
        tournament.logo = logo;
    }
    const newTournament = await T.updateTournament(tournament);
    return res.sendStatus(newTournament ? 200 : 500);
}

export const deleteTournament: express.RequestHandler = async (req, res) => {
    const del = await T.deleteTournament(req.params.id);
    return res.sendStatus(del ? 200 : 500);
}

