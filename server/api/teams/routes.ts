import express from 'express';
import * as T from './middlewares';

const initRoute = (router: express.Router) => {
	router.route('/api/teams').get(T.getTeams).post(T.addTeam);

	router.route('/api/teams/fields').get(T.getFields).patch(T.updateFields);

	router.route('/api/teams/:id').get(T.getTeam).patch(T.updateTeam).delete(T.deleteTeam);

	router.route('/api/teams/logo/:id').get(T.getLogoFile);
};

export default initRoute;
