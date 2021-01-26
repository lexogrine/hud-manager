import express from 'express';
import * as M from './middlewares';

const initRoute = (router: express.Router, io: SocketIO.Server) => {
	router.route('/api/match').get(M.getMatchesRoute).post(M.addMatchRoute);

	router
		.route('/api/match/:id')
		//.get(teams.getTeam)
		.patch(M.updateMatchRoute(io))
		.delete(M.deleteMatchRoute);

	
	router.route('/api/maps').get(M.getMaps);
};

export default initRoute;
