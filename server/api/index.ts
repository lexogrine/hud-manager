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
import * as bakkesmod from './bakkesmod';
import * as f1 from './f1';
import * as I from './../../types/interfaces';
import { initGameConnection } from './huds/play';
import TournamentHandler from './tournaments/routes';
import MatchHandler from './matches/routes';
import PlayerHandler from './players/routes';
import ACOHandler from './aco/routes';
import ARHandler from './ar/routes';
import TimelineHandler from './timeline/routes';
import ARGHandler from './arg/routes';
import * as match from './matches';
import TeamHandler from './teams/routes';
import CloudHandler from './cloud/routes';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ioPromise } from '../socket';
import { app } from '..';
import { checkCloudStatus, uploadLocalToCloud, downloadCloudToLocal } from './cloud';
import { getRadarConfigs } from './huds/radar';
import { SimpleWebSocket } from 'simple-websockets';
import { socket } from './user';
import { canUserUseCloudStorage } from '../../src/utils';
import { registerKeybind } from './keybinder';

let init = true;

export const customer: I.CustomerData = {
	customer: null,
	game: null,
	workspace: null,
	workspaces: null
};

export const registerRoomSetup = (socket: SimpleWebSocket) =>
	new Promise<void>((res, rej) => {
		socket.send('registerAsProxy', user.room.uuid);
		setTimeout(() => {
			if (user.room.uuid) socket.send('registerRoomPlayers', user.room.uuid, user.room.availablePlayers);
			res();
		}, 1000);
	});

export const validateCloudAbility = async (resource?: I.AvailableResources) => {
	if (resource && !I.availableResources.includes(resource)) return false;
	const cfg = await config.loadConfig();
	if (!cfg.sync) return false;

	if (!customer.customer || !customer.customer.license || !canUserUseCloudStorage(customer)) {
		return false;
	}
	return !!customer.game;
};

export default async function () {
	const io = await ioPromise;

	initGameConnection();

	app.route('/api/workspace').post(user.setWorkspace);

	app.route('/api/auth').get(user.getCurrent).post(user.loginHandler).delete(user.logout);

	app.route('/api/config').get(config.getConfig).patch(config.updateConfig);

	app.route('/api/version').get((req, res) => res.json({ version: Application.getVersion() }));

	app.route('/api/version/last').get(machine.getLastLaunchedVersion).post(machine.saveLastLaunchedVersion);

	app.route('/api/camera')
		.get((_req, res) => {
			res.json({
				availablePlayers: user.room.availablePlayers,
				uuid: user.room.uuid,
				password: user.room.password
			});
		})
		.post(async (req, res) => {
			const result = await user.sendPlayersToRoom(req.body, req.query.toggle === 'true');
			return res.sendStatus(result ? 200 : 422);
		})
		.patch(user.setNewRoomUUID);

	TournamentHandler();

	MatchHandler();

	TimelineHandler();

	PlayerHandler();

	TeamHandler();

	ACOHandler();

	ARHandler();

	ARGHandler();

	CloudHandler();

	app.route('/api/games/start/:game').get(async (req, res) => {
		const cfg = await config.loadConfig();

		const game = req.params.game as I.AvailableGames;
		cfg.game = game;

		delete (cfg as any)._id;

		await config.setConfig(cfg);

		customer.game = game;

		const result = await checkCloudStatus(game);

		io.emit('reloadHUDs');

		res.json({ result });

		const registerGame = () => {
			if (socket) {
				socket.send('registerGame', game);
			}
		};

		setTimeout(() => {
			registerGame();
		}, 5000);
	});

	app.route('/api/cloud/upload').post(async (req, res) => {
		const game = customer.game;
		if (!game) return res.sendStatus(403);

		const force = req.query.replace === 'force';

		const result = await uploadLocalToCloud(game, force);

		return res.json({ result });
	});

	app.route('/api/cloud/download').post(async (req, res) => {
		const game = customer.game;
		if (!game) return res.sendStatus(403);
		const result = await downloadCloudToLocal(game);

		return res.json({ result });
	});

	app.route('/api/games/current').get((req, res) => {
		res.json({ game: customer.game, init });
		init = false;
	});

	app.route('/api/huds').get(huds.getHUDs).post(huds.openHUDsDirectory).delete(huds.deleteHUD);

	app.route('/api/huds/action/:hudDir/:action').post(huds.sendActionByHTTP);

	app.route('/api/huds/add').post(huds.sendHUD);

	app.route('/api/huds/close').post(huds.closeHUD);

	app.route('/api/huds/:hudDir/start').post(huds.showHUD);

	app.route('/api/huds/download/:uuid').get(huds.downloadHUD);

	app.route('/api/huds/:hudDir/:section/:asset').get(huds.getHUDCustomAsset);

	app.route('/api/huds/upload/:hudDir').post(huds.uploadHUD);

	app.route('/api/huds/delete/:uuid').delete(huds.deleteHUDFromCloud);

	app.route('/api/radar/maps').get(getRadarConfigs);

	app.route('/api/gsi').get(gsi.checkGSIFile).put(gsi.createGSIFile);

	app.route('/api/import').post(sync.importDb);

	app.route('/api/steam').get((req, res) => res.json({ gamePath: getGamePath(730) }));

	app.route('/api/import/verify').post(sync.checkForConflicts);

	app.route('/api/gsi/download').get(
		gsi.saveFile('gamestate_integration_hudmanager.cfg', gsi.generateGSIFile(customer.game))
	);

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

	app.route('/api/bakkesmod/check').get(bakkesmod.checkStatus);

	app.route('/api/bakkesmod/download/mod').get(bakkesmod.downloadBakkesMod);

	app.route('/api/bakkesmod/download/mod_data').get(bakkesmod.downloadBakkesModData);

	app.route('/api/bakkesmod/download/sos').get(bakkesmod.downloadSosPlugin);

	app.route('/api/bakkesmod/run').get(bakkesmod.runBakkesMod);

	app.route('/api/bakkesmod/install/mod_data').get(bakkesmod.installBakkesModData);

	app.route('/api/bakkesmod/install/sos').get(bakkesmod.installSosPlugin);

	app.route('/api/f1/status').get(f1.getF1Status);
	app.route('/api/f1/install').post(f1.installF1);

	registerKeybind('Left Alt+Left Shift+F', () => io.emit('refreshHUD'));

	registerKeybind('Left Alt+R', match.reverseSide);

	//globalShortcut.register('Left Alt+Left Shift+F', () => io.emit('refreshHUD'));

	//globalShortcut.register('Left Alt+R', match.reverseSide);

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
