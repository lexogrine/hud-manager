import express from 'express';
import { Match, RoundData } from '../../types/interfaces';
import { GSI } from './../sockets';
import db from "./../../init/database";
import socketio from 'socket.io';
import { getTeamById } from './teams';
import { app } from 'electron';
import uuidv4 from 'uuid/v4';
import path from 'path';
import fs from 'fs';
import { CSGO } from 'csgogsi';

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
    });

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

export const reverseSide = async (io: socketio.Server) => {
    const matches = await getMatches();
    const current = matches.find(match => match.current);
    if(!current) return;
    if(current.vetos.filter(veto => veto.teamId).length > 0 && !GSI.last){
        return;
    }
    if(current.vetos.filter(veto => veto.teamId).length === 0){
        current.left = [current.right, current.right = current.left][0];
        await updateMatch([current]);
        return io.emit("match", true);
    }
    const currentVetoMap = current.vetos.find(veto => GSI.last.map.name.includes(veto.mapName));
    if(!currentVetoMap) return;
    currentVetoMap.reverseSide = !currentVetoMap.reverseSide;
    await updateMatch([current]);

    io.emit("match", true);
}

export const updateRound = async (game: CSGO) => {
    if(!game || !game.map || game.map.phase !== "live") return;

    let round = game.map.round;

    if(game.round && game.round.phase !== "over"){
        round++;
    }

    const roundData: RoundData = {
        round,
        players: {}
    };
    for(const player of game.players){
        roundData.players[player.steamid] = {
            kills: player.state.round_kills,
            killshs: player.state.round_killhs,
            damage: player.state.round_totaldmg
        }
    }

    const matches = await getMatches();
    const match = matches.find(match => match.current);

    if(!match) return;

    const mapName = game.map.name.substring(game.map.name.lastIndexOf('/')+1);
    const veto = match.vetos.find(veto => veto.mapName === mapName);

    if(!veto) return;
    if(veto.rounds && veto.rounds[roundData.round - 1] && JSON.stringify(veto.rounds[roundData.round - 1]) === JSON.stringify(roundData)) return;

    match.vetos = match.vetos.map(veto => {
        if(veto.mapName !== mapName) return veto;
        if(!veto.rounds) veto.rounds = [];
        veto.rounds[roundData.round - 1] = roundData;
        return veto;
    });

    return updateMatch(matches);
}
