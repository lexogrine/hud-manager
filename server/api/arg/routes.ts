import { app } from '../..';
import * as A from './middlewares';

const initRoute = () => {
	app.route('/api/arg').get(A.requestARGStatus).post(A.connect).delete(A.disconnect);

	app.route('/api/arg/delay').post(A.saveDelay);

	app.route('/api/arg/order').get(A.getOrder).post(A.setOrder);
};

export default initRoute;
