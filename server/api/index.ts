import express from 'express';
import * as players from './players';
import * as teams from './teams';
import * as match from './match';
import * as config from './config';

export default function (router: express.Router){
    router.route('/api/players')
        .get(players.getPlayers)
        .post(players.addPlayer);
    
    router.route('/api/players/:id')
        .get(players.getPlayers)
        .patch(players.updatePlayer)
        .delete(players.deletePlayer);

    router.route('/api/players/avatar/:id')
        .get(players.getAvatarFile);

    router.route('/api/teams')
        .get(teams.getTeams)
        .post(teams.addTeam);
    
    router.route('/api/teams/:id')
        .get(teams.getTeam)
        .patch(teams.updateTeam)
        .delete(teams.deleteTeam);
    
    router.route('/api/teams/logo/:id')
        .get(teams.getLogoFile)

    router.route('/api/config')
        .get(config.getConfig)
        .patch(config.updateConfig);

    router.route('/api/match')
        .get(match.getMatch)
        .patch(match.setMatch);
        
}