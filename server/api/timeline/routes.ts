import { app } from '../..';
import * as A from './middlewares';

const initRoute = () => {
	app.route('/api/timeline/:game').get(A.getTimeline);
};

export default initRoute;
