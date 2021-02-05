import express from 'express';
import * as P from './middlewares';

const initRoute = (router: express.Router) => {
	router.route('/api/players').get(P.getPlayers).post(P.addPlayer);

	router.route('/api/players/fields').get(P.getFields).patch(P.updateFields);

	router.route('/api/players/:id').get(P.getPlayers).patch(P.updatePlayer).delete(P.deletePlayer);

	router.route('/api/players/avatar/:id').get(P.getAvatarFile);

	router.route('/api/players/avatar/steamid/:steamid').get(P.getAvatarURLBySteamID);
};

export default initRoute;
