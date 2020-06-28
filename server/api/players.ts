import express from 'express';
import db from './../../init/database';
import { Player } from '../../types/interfaces';
import { loadConfig } from './config';
import fetch from 'node-fetch';
import ip from 'ip';

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
async function getPlayerBySteamId(steamid: string): Promise<Player | null>{
    return new Promise((res, rej) => {
        players.findOne({steamid}, (err, player) => {
            if(err){
                return res(null);
            }
            return res(player);
        });
    })
}

export const getPlayersList = (query: any) => new Promise<Player[]>((res, rej) => {
    players.find(query, (err, players) => {
        if(err){
            return res([]);
        }
        return res(players);
    });
});

export const getPlayers: express.RequestHandler = async (req, res) => {
    const players = await getPlayersList({});
    return res.json(players);
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

export const getAvatarFile: express.RequestHandler = async (req, res) => {
    if(!req.params.id){
        return res.sendStatus(422);
    }
    const team = await getPlayerById(req.params.id);
    if(!team || !team.avatar.length){
        return res.sendStatus(404);
    }
    const imgBuffer = Buffer.from(team.avatar, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
}
export const getAvatarURLBySteamID: express.RequestHandler = async (req, res) => {
    if(!req.params.steamid){
        return res.sendStatus(422);
    }
    const config = await loadConfig();
    const response = {
        custom: '',
        steam: ''
    }
    const player = await getPlayerBySteamId(req.params.steamid);
    if(player && player.avatar.length && player._id){
        response.custom = `http://${ip.address()}:${config.port}/api/players/avatar/${player._id}`;
    }
    try {
        if(config.steamApiKey.length === 0){
            return res.json(response);
        }
        const re = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steamApiKey}&steamids=${req.params.steamid}`, {}).then(res => res.json());
        if(re.response && re.response.players && re.response.players[0] && re.response.players[0].avatarfull){
            response.steam = re.response.players[0].avatarfull;
        }
    } catch { }
    return res.json(response);

}

