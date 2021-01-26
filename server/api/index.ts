import express from 'express';
import socketio from 'socket.io';
import { globalShortcut, app } from 'electron';
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
import TournamentHandler from './tournaments/routes';
import MatchHandler from './matches/routes';
import PlayerHandler from './players/routes';
import TeamHandler from './teams/routes';

export const customer: I.CustomerData = {
	customer: null
};

export default function (router: express.Router, io: socketio.Server) {
	router.route('/api/auth').get(user.getCurrent).delete(user.logout);

	router.route('/api/config').get(config.getConfig).patch(config.updateConfig(io));

	router.route('/api/version').get((req, res) => res.json({ version: app.getVersion() }));

	TournamentHandler(router);

	MatchHandler(router, io);

	PlayerHandler(router);

	TeamHandler(router);

	router.route('/api/huds').get(huds.getHUDs).post(huds.openHUDsDirectory).delete(huds.deleteHUD(io));

	router.route('/api/huds/add').post(huds.uploadHUD);

	router.route('/api/huds/close').post(huds.closeHUD);

	router.route('/api/huds/:hudDir/start').post(huds.showHUD(io));

	router.route('/api/gsi').get(gsi.checkGSIFile).put(gsi.createGSIFile);

	router.route('/api/import').post(sync.importDb);

	router.route('/api/steam').get((req, res) => res.json({ gamePath: getGamePath(730) }));

	router.route('/api/import/verify').post(sync.checkForConflicts);

	router.route('/api/gsi/download').get(gsi.saveFile('gamestate_integration_hudmanager.cfg', gsi.generateGSIFile()));

	router.route('/api/db/download').get(gsi.saveFile('hudmanagerdb.json', sync.exportDatabase()));

	//router.route('/api/events')
	//    .get(game.getEvents);

	router.route('/api/game').get(game.getLatestData);

	router.route('/api/game/run').post(game.run);

	router.route('/api/cfg').get(game.checkCFGs).put(game.createCFGs);

	router.route('/api/cfgs/download').get(gsi.saveFile('configs.zip', gsi.cfgsZIPBase64, true));

	router.route('/huds/:dir/').get(huds.renderHUD);

	router.route('/hud/:dir/').get(huds.renderOverlay);

	router.route('/api/machine').get(machine.getMachineId);

	router.use('/huds/:dir/', huds.renderAssets);

	router.route('/huds/:dir/thumbnail').get(huds.renderThumbnail);

	router.route('/api/user').post(user.verifyToken);

	globalShortcut.register('Alt+Shift+F', () => io.emit('refreshHUD'));
	/**
	 * LEGACY ROUTING
	 */
	router.route('/legacy/:hudName/index.js').get(huds.legacyJS);

	router.route('/legacy/:hudName/style.css').get(huds.legacyCSS);

	router.use('/', express.static(path.join(__dirname, '../static/legacy')));

	/**
	 * END OF LEGACY ROUTING
	 */
}
