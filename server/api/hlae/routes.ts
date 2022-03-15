import { app } from '../..';
import * as HLAE from './middlewares';
import { verifyGame } from '../user';

const initRoute = () => {
	app.route('/api/hlae/xray').post(verifyGame, HLAE.setXrayHandler);
};

export default initRoute;
