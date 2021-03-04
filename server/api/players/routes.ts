import { app } from '../..';
import * as P from './middlewares';

const initRoute = () => {
	app.route('/api/players').get(P.getPlayers).post(P.addPlayer);

	app.route('/api/players/fields').get(P.getFields).patch(P.updateFields);

	app.route('/api/players/:id').get(P.getPlayers).patch(P.updatePlayer).delete(P.deletePlayer);

	app.route('/api/players/avatar/:id').get(P.getAvatarFile);

	app.route('/api/players/avatar/steamid/:steamid').get(P.getAvatarURLBySteamID);
};

export default initRoute;
