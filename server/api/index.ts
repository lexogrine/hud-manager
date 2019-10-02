import express from 'express';
import * as players from './players';
import * as teams from './teams';

export default function (router: express.Router){
    router.route('/api/players')
        .get(players.getPlayers)
        .post(players.addPlayer);
    
    router.route('/api/players/:id')
        .get(players.getPlayers)
        .patch(players.updatePlayer)
        .delete(players.deletePlayer);

    router.route('/api/teams')
        .get(teams.getTeam)
        .post(teams.addTeam);
    
    router.route('/api/players/:id')
        .get(teams.getTeam)
        .patch(teams.updateTeam)
        .delete(teams.deleteTeam);
        
}