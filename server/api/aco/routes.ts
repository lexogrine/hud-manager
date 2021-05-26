import { app } from '../..';
import * as A from './middlewares';

const initRoute = () => {
	app.route('/api/aco').get(A.getACO).post(A.updateACOByMap);

	app.route('/api/aco/:mapName').get(A.getACOByMap);
};

export default initRoute;
