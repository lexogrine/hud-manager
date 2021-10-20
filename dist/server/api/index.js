"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const I = __importStar(require("./../../types/interfaces"));
const play_1 = require("./huds/play");
const routes_1 = __importDefault(require("./tournaments/routes"));
const routes_2 = __importDefault(require("./matches/routes"));
const routes_3 = __importDefault(require("./players/routes"));
const routes_4 = __importDefault(require("./aco/routes"));
const routes_5 = __importDefault(require("./ar/routes"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const routes_6 = __importDefault(require("./timeline/routes"));
const routes_7 = __importDefault(require("./arg/routes"));
const match = __importStar(require("./matches"));
const routes_8 = __importDefault(require("./teams/routes"));
const routes_9 = __importDefault(require("./cloud/routes"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const socket_1 = require("../socket");
const __1 = require("..");
const cloud_1 = require("./cloud");
const radar_1 = require("./huds/radar");
const user_1 = require("./user");
const keybinder_1 = require("./keybinder");
let init = true;
const domain = user.USE_LOCAL_BACKEND ? '192.168.50.40:5000' : 'hmapi.lexogrine.com';
exports.customer = {
    customer: null,
    game: null
};
let availablePlayers = [];
const registerRoomSetup = (socket) => {
    setTimeout(() => {
        if (user.room.uuid)
            socket.send('registerRoomPlayers', user.room.uuid, availablePlayers);
    }, 1000);
};
exports.registerRoomSetup = registerRoomSetup;
const validateCloudAbility = async (resource) => {
    if (resource && !I.availableResources.includes(resource))
        return false;
    const cfg = await config.loadConfig();
    if (!cfg.sync)
        return false;
    if (!exports.customer.customer ||
        !exports.customer.customer.license ||
        (exports.customer.customer.license.type !== 'enterprise' && exports.customer.customer.license.type !== 'professional')) {
        return false;
    }
    return !!exports.customer.game;
};
exports.validateCloudAbility = validateCloudAbility;
async function default_1() {
    const io = await socket_1.ioPromise;
    (0, play_1.initGameConnection)();
    __1.app.route('/api/auth').get(user.getCurrent).post(user.loginHandler).delete(user.logout);
    __1.app.route('/api/config').get(config.getConfig).patch(config.updateConfig);
    __1.app.route('/api/version').get((req, res) => res.json({ version: electron_1.app.getVersion() }));
    __1.app.route('/api/version/last').get(machine.getLastLaunchedVersion).post(machine.saveLastLaunchedVersion);
    __1.app.route('/api/camera')
        .get((_req, res) => {
        res.json({ availablePlayers, uuid: user.room.uuid });
    })
        .post((req, res) => {
        if (!Array.isArray(req.body) ||
            !req.body.every(x => typeof x === 'object' && x && typeof x.steamid === 'string' && typeof x.label === 'string'))
            return res.sendStatus(422);
        if (req.body.length > 12)
            return res.sendStatus(422);
        availablePlayers = req.body;
        setTimeout(() => {
            if (user_1.socket)
                (0, node_fetch_1.default)(`${user.USE_LOCAL_BACKEND ? `http://${domain}` : `https://${domain}`}/cameras/setup/${user.room.uuid}`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([...availablePlayers])
                });
        }, 1000);
        return res.sendStatus(200);
    });
    (0, routes_1.default)();
    (0, routes_2.default)();
    (0, routes_6.default)();
    (0, routes_3.default)();
    (0, routes_8.default)();
    (0, routes_4.default)();
    (0, routes_5.default)();
    (0, routes_7.default)();
    (0, routes_9.default)();
    __1.app.route('/api/games/start/:game').get(async (req, res) => {
        const cfg = await config.loadConfig();
        const game = req.params.game;
        cfg.game = game;
        delete cfg._id;
        await config.setConfig(cfg);
        exports.customer.game = game;
        const result = await (0, cloud_1.checkCloudStatus)(game);
        io.emit('reloadHUDs');
        res.json({ result });
    });
    __1.app.route('/api/cloud/upload').post(async (req, res) => {
        const game = exports.customer.game;
        if (!game)
            return res.sendStatus(403);
        const result = await (0, cloud_1.uploadLocalToCloud)(game);
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
    __1.app.route('/api/db/download').get(gsi.saveFile('hudmanagerdb.json', sync.exportDatabase()));
    //router.route('/api/events')
    //    .get(game.getEvents);
    __1.app.route('/api/game').get(game.getLatestData);
    __1.app.route('/api/game/run').post(game.run);
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
