import { app } from '../..';
import * as T from './middlewares';
import { verifyGame } from '../user';

const initRoute = () => {
	app.route('/api/teams').get(verifyGame, T.getTeams).post(verifyGame, T.addTeam);

	app.route('/api/teams/fields').get(T.getFields).patch(T.updateFields);

	app.route('/api/teams/:id').get(T.getTeam).patch(T.updateTeam).delete(T.deleteTeam);

	app.route('/api/teams/logo/:id').get(T.getLogoFile);
};

export default initRoute;
