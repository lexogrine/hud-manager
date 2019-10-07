import express from 'express';
import * as players from './players';
import * as teams from './teams';
import * as config from './config';

export default function (router: express.Router){
    router.route('/api/players')
        .get(players.getPlayers)
        .post(players.addPlayer);
    
    router.route('/api/players/:id')
        .get(players.getPlayers)
        .patch(players.updatePlayer)
        .delete(players.deletePlayer);

    router.route('/api/teams')
        .get(teams.getTeams)
        .post(teams.addTeam);
    
    router.route('/api/teams/:id')
        .get(teams.getTeam)
        .patch(teams.updateTeam)
        .delete(teams.deleteTeam);

    router.route('/api/config')
        .get(config.getConfig)
        .patch(config.updateConfig);
        
}