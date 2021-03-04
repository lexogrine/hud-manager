import { app } from '../..';
import * as T from './middlewares';

const initRoute = () => {
	app.route('/api/teams').get(T.getTeams).post(T.addTeam);

	app.route('/api/teams/fields').get(T.getFields).patch(T.updateFields);

	app.route('/api/teams/:id').get(T.getTeam).patch(T.updateTeam).delete(T.deleteTeam);

	app.route('/api/teams/logo/:id').get(T.getLogoFile);
};

export default initRoute;
