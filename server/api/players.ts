import express from 'express';
import db from './../../init/database';
import { Player } from '../../types/interfaces';

const players = db.players;

async function getPlayerById(id: string): Promise<Player | null>{
    return new Promise((res, rej) => {
        players.findOne({_id:id}, (err, player) => {
            if(err){
                return res(null);
            }
            return res(player);
        });
    })
}

export const getPlayers: express.RequestHandler = (req, res) => {
    players.find({}, (err, players) => {
        if(err){
            return res.sendStatus(500);
        }
        return res.json(players);
    });
}
export const getPlayer: express.RequestHandler = async (req, res) => {
    if(!req.params.id){
        return res.sendStatus(422);
    }

    const player = await getPlayerById(req.params.id);

    if(!player){
        return res.sendStatus(404);
    }

    return res.json(player);
}
export const updatePlayer: express.RequestHandler = async (req, res) => {
    if(!req.params.id){
        return res.sendStatus(422);
    }
    const player = await getPlayerById(req.params.id);
    if(!player){
        return res.sendStatus(404);
    }

    const updated: Player = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        avatar: req.body.avatar,
        country: req.body.country,
        steamid: req.body.steamid
    }

    players.update({_id:req.params.id}, { $set:updated }, {}, async err => {
        if(err){
            return res.sendStatus(500);
        }
        const player = await getPlayerById(req.params.id);
        return res.json(player);

    });
}
export const addPlayer: express.RequestHandler = (req, res) => {
    const newPlayer: Player = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        avatar: req.body.avatar,
        country: req.body.country,
        steamid: req.body.steamid
    };
    players.insert(newPlayer, (err, player) => {
        if(err){
            return res.sendStatus(500);
        }
        return res.json(player);
    });
}
export const deletePlayer: express.RequestHandler = async (req, res) => {
    if(!req.params.id){
        return res.sendStatus(422);
    }
    const player = await getPlayerById(req.params.id);
    if(!player){
        return res.sendStatus(404);
    }
    players.remove({_id:req.params.id}, (err, n) => {
        if(err){
            return res.sendStatus(500);
        }
        return res.sendStatus(n ? 200 : 404);
    });
}