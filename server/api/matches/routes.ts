import express from 'express';
import { Server } from 'socket.io';
import * as M from './middlewares';

const initRoute = (router: express.Router, io: Server) => {
	router.route('/api/match').get(M.getMatchesRoute).post(M.addMatchRoute);

	router.route('/api/match/current').get(M.getCurrentMatchRoute);

	router.route('/api/match/:id').get(M.getMatchRoute).patch(M.updateMatchRoute(io)).delete(M.deleteMatchRoute);

	router.route('/api/maps').get(M.getMaps);
};

export default initRoute;
