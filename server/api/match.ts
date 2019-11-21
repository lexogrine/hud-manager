import express from 'express';
import { Match } from '../../types/interfaces';
import { GSI } from './../sockets';
import socketio from 'socket.io';
import { getTeamById } from './teams';
import uuidv4 from 'uuid/v4';

const testmatches: Match[] = [{
    id:'a',
    left: {
        id:'H427BFDoR9chqgwe',
        wins:0,
    },
    right: {
        id:'XXH5JceBg3miQgBt',
        wins:0,
    },
    current: true,
    matchType: 'bo3',
    vetos: [
        {teamId:"H427BFDoR9chqgwe",mapName:"de_overpass", side:"CT",type:"pick","mapEnd":false},
        {teamId: '', mapName: '', side: 'NO', type:'pick', mapEnd: false,},
        {teamId: '', mapName: '', side: 'NO', type:'pick', mapEnd: false,},
        {teamId: '', mapName: '', side: 'NO', type:'pick', mapEnd: false,},
        {teamId: '', mapName: '', side: 'NO', type:'pick', mapEnd: false,},
        {teamId: '', mapName: '', side: 'NO', type:'pick', mapEnd: false,},
        {teamId: '', mapName: '', side: 'NO', type:'pick', mapEnd: false,}
    ]
}];

class MatchManager {
    matches: Match[]
    constructor(){
        const load = async () => {
            const current = this.matches.filter(match => match.current)[0];
            if(!current) return;
            const left = await getTeamById(current.left.id);
            const right = await getTeamById(current.right.id);
        
            if(left && left._id){
                GSI.setTeamOne({id:left._id, name:left.name, country:left.country, logo:left.logo, map_score:current.left.wins});
            }
            if(right && right._id){
                GSI.setTeamTwo({id:right._id, name:right.name, country:right.country, logo:right.logo, map_score:current.right.wins});
            }
        }
        this.matches = testmatches;
        load();
    }
    set(matches: Match[]){
        this.matches = matches;
    }
}

const matchManager = new MatchManager();

export const getMatches: express.RequestHandler = (req, res) => {
    return res.json(matchManager.matches);
}

export const getMatchesV2 = () =>{
    return matchManager.matches;
}

export const updateMatch = async (updateMatches: Match[]) => {
    const currents = updateMatches.filter(match => match.current);
    if(currents.length > 1){
        matchManager.set(updateMatches.map(match => ({...match, current: false})));
        return;
    }
    if(currents.length){
        const left = await getTeamById(currents[0].left.id);
        const right = await getTeamById(currents[0].right.id);
    
        if(left && left._id){
            GSI.setTeamOne({id:left._id, name:left.name, country:left.country, logo:left.logo, map_score:currents[0].left.wins});
        }
        if(right && right._id){
            GSI.setTeamTwo({id:right._id, name:right.name, country:right.country, logo:right.logo, map_score:currents[0].right.wins});
        }
    }

    const matchesFixed = updateMatches.map(match => {
        if(match.id.length) return match;
        match.id = uuidv4();
        return match;
    })

    matchManager.set(matchesFixed);
    //console.log(updateMatches);
    //matches.length = 0;
    //console.log(JSON.stringify(updateMatches));
    //matches.push(...updateMatches);

}


export const setMatch = (io: socketio.Server) => async (req, res) => {
    await updateMatch(req.body);
    io.emit('match');
    return res.json(matchManager.matches);
}