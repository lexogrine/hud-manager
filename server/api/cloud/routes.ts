import { app } from '../..';
import * as C from './middlewares';

const initRoute = () => {
	app.route('/api/cloud/size').get(C.getCloudSize);
};

export default initRoute;
