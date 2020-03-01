import express from 'express';
import { Match } from '../../types/interfaces';
import { GSI } from './../sockets';
import db from "./../../init/database";
import socketio from 'socket.io';
import { getTeamById } from './teams';
import { app } from 'electron';
import uuidv4 from 'uuid/v4';
import path from 'path';
import fs from 'fs';

const matchesDb = db.matches;

export const getMatchesRoute: express.RequestHandler = async (req, res) => {
    const matches = await getMatches();
    return res.json(matches);
}

export const getMatches = (): Promise<Match[]> => {
    return new Promise((res, rej) => {
        matchesDb.find({}, (err, matches) => {
            if (err) {
                return res([]);
            }
            return res(matches);
        });
    });
}

export const setMatches = (matches: Match[]): Promise<Match[] | null> => {
    return new Promise((res,rej) => {
        matchesDb.remove({}, { multi: true}, (err, n) => {
            if (err) {
                return res(null);
            }
            matchesDb.insert(matches, (err, added) => {
                if (err) {
                    return res(null);
                }
                return res(added);
            })
        });
    });
}

export const updateMatch = async (updateMatches: Match[]) => {
    const currents = updateMatches.filter(match => match.current);
    if (currents.length > 1) {
        updateMatches = updateMatches.map(match => ({ ...match, current: false }));
    }
    if (currents.length) {
        const left = await getTeamById(currents[0].left.id);
        const right = await getTeamById(currents[0].right.id);

        if (left && left._id) {
            GSI.setTeamOne({ id: left._id, name: left.name, country: left.country, logo: left.logo, map_score: currents[0].left.wins });
        }
        if (right && right._id) {
            GSI.setTeamTwo({ id: right._id, name: right.name, country: right.country, logo: right.logo, map_score: currents[0].right.wins });
        }
    }

    const matchesFixed = updateMatches.map(match => {
        if (match.id.length) return match;
        match.id = uuidv4();
        return match;
    })
    await setMatches(matchesFixed);

}


export const setMatch = (io: socketio.Server) => async (req, res) => {
    await updateMatch(req.body);
    io.emit('match');
    const matches = await getMatches();
    return res.json(matches);
}

export const getMaps: express.RequestHandler = (req, res) => {
    const defaultMaps = ["de_mirage", "de_dust2", "de_inferno", "de_nuke", "de_train", "de_overpass", "de_vertigo"];
    const mapFilePath = path.join(app.getPath('userData'), 'maps.json');
    try {
        const maps = JSON.parse(fs.readFileSync(mapFilePath, "utf8"));
        if(Array.isArray(maps)){
            return res.json(maps);
        }
        return res.json(defaultMaps);
    } catch {
        return res.json(defaultMaps);
    }
}