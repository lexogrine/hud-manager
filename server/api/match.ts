import express from 'express';
import { Match } from '../../types/interfaces';

const match: Match = {
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

export const setMatch: express.RequestHandler = (req, res) => {
    match.left = {
        id: req.body.left.id,
        wins: req.body.left.wins
    };
    match.right = {
        id: req.body.right.id,
        wins: req.body.right.wins
    };
    match.matchType = req.body.matchType;
    match.vetos = req.body.vetos;

    return res.json(match);
}