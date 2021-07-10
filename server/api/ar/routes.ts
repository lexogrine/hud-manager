import { app } from '../..';
import * as AR from './middlewares';
import { verifyGame } from '../user';

const initRoute = () => {
	app.route('/api/ar').get(verifyGame, AR.getARModules);

	app.use('/ars/:dir/', AR.getARModulesAssets);
};

export default initRoute;
