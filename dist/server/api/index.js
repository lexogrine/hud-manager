"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCloudAbility = exports.registerRoomSetup = exports.customer = void 0;
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const steam_game_path_1 = require("steam-game-path");
const config = __importStar(require("./config"));
const huds = __importStar(require("./huds"));
const path = __importStar(require("path"));
const gsi = __importStar(require("./gamestate"));
const game = __importStar(require("./game"));
const sync = __importStar(require("./sync"));
const machine = __importStar(require("./machine"));
const user = __importStar(require("./user"));
const bakkesmod = __importStar(require("./bakkesmod"));
const f1 = __importStar(require("./f1"));
const appUsage = __importStar(require("./appUsage"));
const I = __importStar(require("./../../types/interfaces"));
const play_1 = require("./huds/play");
const routes_1 = __importDefault(require("./tournaments/routes"));
const routes_2 = __importDefault(require("./matches/routes"));
const routes_3 = __importDefault(require("./players/routes"));
const routes_4 = __importDefault(require("./aco/routes"));
const routes_5 = __importDefault(require("./ar/routes"));
const routes_6 = __importDefault(require("./timeline/routes"));
const routes_7 = __importDefault(require("./hlae/routes"));
const routes_8 = __importDefault(require("./arg/routes"));
const match = __importStar(require("./matches"));
const routes_9 = __importDefault(require("./teams/routes"));
const routes_10 = __importDefault(require("./cloud/routes"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const socket_1 = require("../socket");
const __1 = require("..");
const cloud_1 = require("./cloud");
const radar_1 = require("./huds/radar");
const user_1 = require("./user");
const utils_1 = require("../../src/utils");
const keybinder_1 = require("./keybinder");
const database_1 = require("../../init/database");
//import { Server } from 'socket.io';
//import { DefaultEventsMap } from 'socket.io/dist/typed-events';
let init = true;
exports.customer = {
    customer: null,
    game: null,
    workspace: null,
    workspaces: null
};
const registerRoomSetup = (socket) => new Promise((res, rej) => {
    socket.send('registerAsProxy', user.room.uuid);
    setTimeout(() => {
        if (user.room.uuid)
            socket.send('registerRoomPlayers', user.room.uuid, user.room.availablePlayers);
        res();
    }, 1000);
});
exports.registerRoomSetup = registerRoomSetup;
const validateCloudAbility = async (resource) => {
    if (resource && !I.availableResources.includes(resource))
        return false;
    const cfg = await config.loadConfig();
    if (!cfg.sync)
        return false;
    if (!exports.customer.customer || !exports.customer.customer.license || !(0, utils_1.canUserUseCloudStorage)(exports.customer)) {
        return false;
    }
    return !!exports.customer.game;
};
exports.validateCloudAbility = validateCloudAbility;
async function default_1( /*io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>*/) {
    const io = await socket_1.ioPromise;
    (0, play_1.initGameConnection)();
    __1.app.route('/api/workspace').post(user.setWorkspace);
    __1.app.route('/api/auth').get(user.getCurrent).post(user.loginHandler).delete(user.logout);
    __1.app.route('/api/config').get(config.getConfig).patch(config.updateConfig);
    __1.app.route('/api/version').get((req, res) => res.json({ version: electron_1.app.getVersion() }));
    __1.app.route('/api/version/last').get(machine.getLastLaunchedVersion).post(machine.saveLastLaunchedVersion);
    __1.app.route('/api/camera')
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
    (0, routes_1.default)();
    (0, routes_2.default)();
    (0, routes_6.default)();
    (0, routes_3.default)();
    (0, routes_9.default)();
    (0, routes_4.default)();
    (0, routes_5.default)();
    (0, routes_8.default)();
    (0, routes_10.default)();
    (0, routes_7.default)();
    __1.app.route('/api/games/start/:game').get(async (req, res) => {
        const cfg = await config.loadConfig();
        const game = req.params.game;
        cfg.game = game;
        delete cfg._id;
        await config.setConfig(cfg);
        exports.customer.game = game;
        const result = await (0, cloud_1.checkCloudStatus)(game);
        if (exports.customer?.customer?.user)
            (0, database_1.setSessionStore)({ game });
        io.emit('reloadHUDs');
        res.json({ result });
        const registerGame = () => {
            if (user_1.socket) {
                user_1.socket.send('registerGame', game);
            }
        };
        setTimeout(() => {
            registerGame();
        }, 5000);
    });
    __1.app.route('/api/cloud/upload').post(async (req, res) => {
        const game = exports.customer.game;
        if (!game)
            return res.sendStatus(403);
        const force = req.query.replace === 'force';
        const result = await (0, cloud_1.uploadLocalToCloud)(game, force);
        return res.json({ result });
    });
    __1.app.route('/api/cloud/download').post(async (req, res) => {
        const game = exports.customer.game;
        if (!game)
            return res.sendStatus(403);
        const result = await (0, cloud_1.downloadCloudToLocal)(game);
        return res.json({ result });
    });
    __1.app.route('/api/games/current').get((req, res) => {
        res.json({ game: exports.customer.game, init });
        init = false;
    });
    __1.app.route('/api/huds').get(huds.getHUDs).post(huds.openHUDsDirectory).delete(huds.deleteHUD);
    __1.app.route('/api/huds/action/:hudDir/:action').post(huds.sendActionByHTTP);
    __1.app.route('/api/huds/add').post(huds.sendHUD);
    __1.app.route('/api/huds/close').post(huds.closeHUD);
    __1.app.route('/api/huds/:hudDir/start').post(huds.showHUD);
    __1.app.route('/api/huds/download/:uuid').get(huds.downloadHUD);
    __1.app.route('/api/huds/:hudDir/:section/:asset').get(huds.getHUDCustomAsset);
    __1.app.route('/api/huds/upload/:hudDir').post(huds.uploadHUD);
    __1.app.route('/api/huds/delete/:uuid').delete(huds.deleteHUDFromCloud);
    __1.app.route('/api/radar/maps').get(radar_1.getRadarConfigs);
    __1.app.route('/api/gsi').get(gsi.checkGSIFile).put(gsi.createGSIFile);
    __1.app.route('/api/import').post(sync.importDb);
    __1.app.route('/api/steam').get((req, res) => res.json({ gamePath: (0, steam_game_path_1.getGamePath)(730) }));
    __1.app.route('/api/import/verify').post(sync.checkForConflicts);
    __1.app.route('/api/gsi/download').get(gsi.saveFile('gamestate_integration_hudmanager.cfg', gsi.generateGSIFile(exports.customer.game)));
    __1.app.route('/api/db/download').get(gsi.saveFile('hudmanagerdb.json', sync.exportDatabase));
    //router.route('/api/events')
    //    .get(game.getEvents);
    __1.app.route('/api/game').get(game.getLatestData);
    __1.app.route('/api/game/run').post(game.run);
    __1.app.route('/api/dota2/run').post(game.runDota2);
    __1.app.route('/api/cfg').get(game.checkCFGs).put(game.createCFGs);
    __1.app.route('/api/cfgs/download').get(gsi.saveFile('configs.zip', gsi.cfgsZIPBase64, true));
    __1.app.route('/huds/:dir/').get(huds.renderHUD);
    __1.app.route('/hud/:dir/').get(huds.renderOverlay());
    __1.app.route('/development/').get(huds.renderOverlay(true));
    __1.app.use('/dev', huds.verifyOverlay, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: 'http://localhost:3500', ws: true, logLevel: 'silent' }));
    __1.app.route('/api/machine').get(machine.getMachineIdRoute);
    __1.app.use('/huds/:dir/', huds.renderAssets);
    __1.app.route('/huds/:dir/thumbnail').get(huds.renderThumbnail);
    __1.app.route('/api/bakkesmod/check').get(bakkesmod.checkStatus);
    __1.app.route('/api/bakkesmod/download/mod').get(bakkesmod.downloadBakkesMod);
    __1.app.route('/api/bakkesmod/download/mod_data').get(bakkesmod.downloadBakkesModData);
    __1.app.route('/api/bakkesmod/download/sos').get(bakkesmod.downloadSosPlugin);
    __1.app.route('/api/bakkesmod/run').get(bakkesmod.runBakkesMod);
    __1.app.route('/api/bakkesmod/install/mod_data').get(bakkesmod.installBakkesModData);
    __1.app.route('/api/bakkesmod/install/sos').get(bakkesmod.installSosPlugin);
    __1.app.route('/api/usage')
        .get(appUsage.getAppUsage)
        .put(appUsage.increaseAppUsage)
        .post(appUsage.uploadAppUsage)
        .delete(appUsage.resetAppUsage);
    __1.app.route('/api/f1/status').get(f1.getF1Status);
    __1.app.route('/api/f1/install').post(f1.installF1);
    (0, keybinder_1.registerKeybind)('Left Alt+Left Shift+F', () => io.emit('refreshHUD'));
    (0, keybinder_1.registerKeybind)('Left Alt+R', match.reverseSide);
    //globalShortcut.register('Left Alt+Left Shift+F', () => io.emit('refreshHUD'));
    //globalShortcut.register('Left Alt+R', match.reverseSide);
    /**
     * LEGACY ROUTING
     */
    __1.app.route('/legacy/:hudName/index.js').get(huds.legacyJS);
    __1.app.route('/legacy/:hudName/style.css').get(huds.legacyCSS);
    __1.app.use('/', express_1.default.static(path.join(__dirname, '../static/legacy')));
    /**
     * END OF LEGACY ROUTING
     */
}
exports.default = default_1;
