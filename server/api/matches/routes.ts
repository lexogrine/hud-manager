import { app } from '../..';
import * as M from './middlewares';

const initRoute = () => {
	app.route('/api/match').get(M.getMatchesRoute).post(M.addMatchRoute);

	app.route('/api/match/current').get(M.getCurrentMatchRoute);

	app.route('/api/match/:id').get(M.getMatchRoute).patch(M.updateMatchRoute).delete(M.deleteMatchRoute);

	app.route('/api/maps').get(M.getMaps);
};

export default initRoute;
