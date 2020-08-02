import express from 'express';

const initRoute = (router: express.Router) => {
    router.route('/api/tournaments')
}

export default initRoute;
