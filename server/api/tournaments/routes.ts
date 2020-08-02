import express from 'express';
import * as T from './middlewares';

const initRoute = (router: express.Router) => {
    router.route('/api/tournaments')
        .get(T.getTournaments)
        .post(T.addTournament);

    router.route('/api/tournaments/:id')
        .post(T.bindMatchToMatchup)
        .patch(T.updateTournament)
        .delete(T.deleteTournament)
}

export default initRoute;
