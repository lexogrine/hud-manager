import { app } from '../..';
import * as T from './middlewares';

const initRoute = () => {
	app.route('/api/tournaments').get(T.getTournaments).post(T.addTournament);

	app.route('/api/tournament').get(T.getCurrentTournament);

	app
		.route('/api/tournaments/:id')
		.post(T.bindMatchToMatchup)
		.patch(T.updateTournament)
		.delete(T.deleteTournament);
};

export default initRoute;
