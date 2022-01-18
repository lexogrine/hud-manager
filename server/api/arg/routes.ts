import { app } from '../..';
import * as A from './middlewares';

const initRoute = () => {
	app.route('/api/arg').get(A.requestARGStatus).post(A.connect).delete(A.disconnect);

	app.route('/api/arg/delay').post(A.saveDelay);

	app.route('/api/arg/save').post(A.saveClips);

	app.route('/api/arg/order').get(A.getOrder).post(A.setOrder);

	app.route('/api/arg/online').post(A.setOnline);

	app.route('/api/arg/safeband').post(A.setSafeband);

	app.route('/api/arg/hlae').post(A.setHLAE);
};

export default initRoute;
