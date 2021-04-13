import express from 'express';
import { globalShortcut, app as Application } from 'electron';
import { getGamePath } from 'steam-game-path';
import * as config from './config';
import * as huds from './huds';
import * as path from 'path';
import * as gsi from './gamestate';
import * as game from './game';
import * as sync from './sync';
import * as machine from './machine';
import * as user from './user';
import * as I from './../../types/interfaces';
import { initGameConnection } from './huds/play';
import TournamentHandler from './tournaments/routes';
import MatchHandler from './matches/routes';
import PlayerHandler from './players/routes';
import * as match from './matches';
import TeamHandler from './teams/routes';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ioPromise } from '../socket';
import { app } from '..';
import { checkCloudStatus } from './cloud';

export const customer: I.CustomerData = {
	customer: null,
	game: null
};

export const validateCloudAbility = () => {
	if (
		!customer.customer ||
		!customer.customer.license ||
		(customer.customer.license.type !== 'enterprise' && customer.customer.license.type !== 'professional')
	) {
		return false;
	}
	return !!customer.game;
};

export default async function () {
	const io = await ioPromise;

	initGameConnection();

	app.route('/api/auth').get(user.getCurrent).post(user.loginHandler).delete(user.logout);

	app.route('/api/config').get(config.getConfig).patch(config.updateConfig);

	app.route('/api/version').get((req, res) => res.json({ version: Application.getVersion() }));

	TournamentHandler();

	MatchHandler();

	PlayerHandler();

	TeamHandler();

	app.route('/api/games/start/:game').get(async (req, res) => {
		const game = req.params.game as I.AvailableGames;
		customer.game = game;
		const result = await checkCloudStatus(game);

		res.json({ result });
	});

	app.route('/api/games/current').get((req, res) => res.json({ game: customer.game }));

	app.route('/api/huds').get(huds.getHUDs).post(huds.openHUDsDirectory).delete(huds.deleteHUD);

	app.route('/api/huds/add').post(huds.uploadHUD);

	app.route('/api/huds/close').post(huds.closeHUD);

	app.route('/api/huds/:hudDir/start').post(huds.showHUD);

	app.route('/api/gsi').get(gsi.checkGSIFile).put(gsi.createGSIFile);

	app.route('/api/import').post(sync.importDb);

	app.route('/api/steam').get((req, res) => res.json({ gamePath: getGamePath(730) }));

	app.route('/api/import/verify').post(sync.checkForConflicts);

	app.route('/api/gsi/download').get(gsi.saveFile('gamestate_integration_hudmanager.cfg', gsi.generateGSIFile()));

	app.route('/api/db/download').get(gsi.saveFile('hudmanagerdb.json', sync.exportDatabase()));

	//router.route('/api/events')
	//    .get(game.getEvents);

	app.route('/api/game').get(game.getLatestData);

	app.route('/api/game/run').post(game.run);

	app.route('/api/cfg').get(game.checkCFGs).put(game.createCFGs);

	app.route('/api/cfgs/download').get(gsi.saveFile('configs.zip', gsi.cfgsZIPBase64, true));

	app.route('/huds/:dir/').get(huds.renderHUD);

	app.route('/hud/:dir/').get(huds.renderOverlay());

	app.route('/development/').get(huds.renderOverlay(true));

	app.use(
		'/dev',
		huds.verifyOverlay,
		createProxyMiddleware({ target: 'http://localhost:3500', ws: true, logLevel: 'silent' })
	);

	app.route('/api/machine').get(machine.getMachineIdRoute);

	app.use('/huds/:dir/', huds.renderAssets);

	app.route('/huds/:dir/thumbnail').get(huds.renderThumbnail);

	globalShortcut.register('Alt+Shift+F', () => io.emit('refreshHUD'));

	globalShortcut.register('Alt+R', match.reverseSide);
	/**
	 * LEGACY ROUTING
	 */
	app.route('/legacy/:hudName/index.js').get(huds.legacyJS);

	app.route('/legacy/:hudName/style.css').get(huds.legacyCSS);

	app.use('/', express.static(path.join(__dirname, '../static/legacy')));

	/**
	 * END OF LEGACY ROUTING
	 */
}
