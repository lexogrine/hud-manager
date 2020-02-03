import express from 'express';
import { Match } from '../../types/interfaces';
import { GSI } from './../sockets';
import db from "./../../init/database";
import socketio from 'socket.io';
import { getTeamById } from './teams';
import uuidv4 from 'uuid/v4';

const matchesDb = db.matches;

const testmatches: Match[] = [{
    id: "a",
    left: {
        id: "H427BFDoR9chqgwe",
        wins: 0
    },
    right: {
        id: "XXH5JceBg3miQgBt",
        wins: 0
    },
    current: true,
    matchType: "bo3",
    vetos: [
        { teamId: "H427BFDoR9chqgwe", mapName: "de_overpass", side: "CT", type: "pick", mapEnd: false },
        { teamId: "XXH5JceBg3miQgBt", mapName: "de_mirage", side: "T", type: "pick", mapEnd: false, reverseSide: true },
        { teamId: "H427BFDoR9chqgwe", mapName: "de_inferno", side: "CT", type: "pick", mapEnd: false },
        { teamId: "", mapName: "", side: "NO", type: "pick", mapEnd: false },
        { teamId: "", mapName: "", side: "NO", type: "pick", mapEnd: false },
        { teamId: "", mapName: "", side: "NO", type: "pick", mapEnd: false },
        { teamId: "", mapName: "", side: "NO", type: "pick", mapEnd: false }
    ]
}];

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

    //console.log(updateMatches);
    //matches.length = 0;
    //console.log(JSON.stringify(updateMatches));
    //matches.push(...updateMatches);

}


export const setMatch = (io: socketio.Server) => async (req, res) => {
    await updateMatch(req.body);
    io.emit('match');
    const matches = await getMatches();
    return res.json(matches);
}