import express from 'express';
import { Match } from '../../types/interfaces';
import { GSI } from './../sockets';
import { getTeamById } from './teams';

export const match: Match = {
    left: {
        id: null,
        wins: 0,
    },
    right: {
        id: null,
        wins: 0
    },
    matchType: 'bo1',
    vetos: []
}

export const getMatch: express.RequestHandler = (req, res) => {
    return res.json(match);
}

export const getMatchV2 = () =>{
    return match;
}

export const updateMatch = async (updateMatch: Match) => {
    if(updateMatch.left.id){
        const left = await getTeamById(updateMatch.left.id);
        if(left && left._id){
            GSI.setTeamOne({id:left._id, name:left.name, country:left.country, logo:left.logo, map_score:updateMatch.left.wins});
        }
    }
    if(updateMatch.right.id){
        const right = await getTeamById(updateMatch.right.id);
        if(right && right._id){
            GSI.setTeamTwo({id:right._id, name:right.name, country:right.country, logo:right.logo, map_score:updateMatch.right.wins});
        }
    }
    match.left = {
        id: updateMatch.left.id,
        wins: updateMatch.left.wins
    };
    match.right = {
        id: updateMatch.right.id,
        wins: updateMatch.right.wins
    };
    match.matchType = updateMatch.matchType;
    match.vetos = updateMatch.vetos;
}

export const setMatch: express.RequestHandler = (req, res) => {
    /*match.left = {
        id: req.body.left.id,
        wins: req.body.left.wins
    };
    match.right = {
        id: req.body.right.id,
        wins: req.body.right.wins
    };
    match.matchType = req.body.matchType;
    match.vetos = req.body.vetos;*/
    updateMatch(req.body);

    return res.json(match);
}