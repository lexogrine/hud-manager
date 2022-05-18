import { app } from '../..';
import * as P from './middlewares';
import { verifyGame } from '../user';
import { saveFile } from '../gamestate';
import { exportPlayers } from '.';

const initRoute = () => {
	app.route('/api/players').get(verifyGame, P.getPlayers).post(verifyGame, P.addPlayer);

	app.route('/api/players/import').post(verifyGame, P.addPlayersWithExcel);

	app.route('/api/players/export').post(verifyGame, saveFile('player.xlsx', '', false, exportPlayers));

	app.route('/api/players/fields').get(P.getFields).patch(P.updateFields);

	app.route('/api/players/:id').get(P.getPlayers).patch(P.updatePlayer).delete(P.deletePlayer);

	app.route('/api/players/avatar/:id').get(P.getAvatarFile);

	app.route('/api/players/avatar/steamid/:steamid').get(P.getAvatarURLBySteamID);
};

export default initRoute;
