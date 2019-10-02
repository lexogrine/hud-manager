import express from 'express';
import db from './../../init/database';
import { Team } from '../../types/interfaces';

const teams = db.teams;

async function getTeamById(id: string): Promise<Team | null>{
    return new Promise((res, rej) => {
        teams.findOne({_id:id}, (err, team) => {
            if(err){
                return res(null);
            }
            return res(team);
        });
    })
}
export const getTeams: express.RequestHandler = (req, res) => {
    teams.find({}, (err, teams) => {
        if(err){
            return res.sendStatus(500);
        }
        return res.json(teams);
    });
}
export const getTeam: express.RequestHandler = async (req, res) => {
    if(!req.params.id){
        return res.sendStatus(422);
    }

    const team = await getTeamById(req.params.id);

    if(!team){
        return res.sendStatus(404);
    }

    return res.json(team);
}
export const addTeam: express.RequestHandler = (req, res) => {
    const newTeam = {
        name: req.body.name,
        logo: req.body.logo,
        country: req.body.country
    };
    teams.insert(newTeam, err => {
        if(err){
            return res.sendStatus(500);
        }
        return res.sendStatus(200);
    });
}
export const updateTeam: express.RequestHandler = async (req, res) => {
    if(!req.params.id){
        return res.sendStatus(422);
    }
    const team = await getTeamById(req.params.id);
    if(!team){
        return res.sendStatus(404);
    }

    const updated = {
        name: req.body.name,
        logo: req.body.logo,
        country: req.body.country
    }

    teams.update({_id:req.params.id}, { $set:updated }, {}, err => {
        if(err){
            return res.sendStatus(500);
        }
        return res.sendStatus(200);

    });
}
export const deleteTeam: express.RequestHandler = async (req, res) => {
    if(!req.params.id){
        return res.sendStatus(422);
    }
    const team = await getTeamById(req.params.id);
    if(!team){
        return res.sendStatus(404);
    }
    teams.remove({_id:req.params.id}, (err, n) => {
        if(err){
            return res.sendStatus(500);
        }
        return res.sendStatus(n ? 200 : 404);
    });
}