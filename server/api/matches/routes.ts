import { app } from '../..';
import * as M from './middlewares';
import { verifyGame } from '../user';

const initRoute = () => {
	app.route('/api/match').get(verifyGame, M.getMatchesRoute).post(verifyGame, M.addMatchRoute);

	app.route('/api/match/current').get(verifyGame, M.getCurrentMatchRoute);

	app.route('/api/match/:id').get(M.getMatchRoute).patch(M.updateMatchRoute).delete(M.deleteMatchRoute);

	app.route('/api/maps').get(M.getMaps);
};

export default initRoute;
