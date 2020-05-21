
import * as I from './../../types/interfaces';
import db from './../../init/database';
import express from 'express';
const { teams: teamsDb, players: playersDb } = db;
interface DB {
    teams: I.Team[];
    players: I.Player[];
}
async function importPlayers(players: I.Player[]){
    return new Promise<I.Player[]>((res, rej) => {
        playersDb.insert(players, (err, newDocs) => {
            if(err) return res([]);
            return res(newDocs);
        });
    })
}
async function importTeams(teams: I.Team[]){
    return new Promise<I.Team[]>((res, rej) => {
        teamsDb.insert(teams, (err, newDocs) => {
            if(err) return res([]);
            return res(newDocs);
        });
    })
}

export async function exportDatabase(){
    const pl = new Promise<I.Player[]>((res, rej) => {
        playersDb.find({}, (err, players) => {
            if(err){
                return res([])
            }
            return res(players);
        });
    });
    const tm = new Promise<I.Team[]>((res, rej) => {
        teamsDb.find({}, (err, teams) => {
            if(err){
                return res([])
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
    try {
        await Promise.all([importPlayers(db.players), importTeams(db.teams)]);
        return res.sendStatus(200);
    } catch {
        return res.sendStatus(500);
    }
}
