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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCloudAbility = exports.customer = void 0;
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
const play_1 = require("./huds/play");
const routes_1 = __importDefault(require("./tournaments/routes"));
const routes_2 = __importDefault(require("./matches/routes"));
const routes_3 = __importDefault(require("./players/routes"));
const match = __importStar(require("./matches"));
const routes_4 = __importDefault(require("./teams/routes"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const socket_1 = require("../socket");
const __1 = require("..");
const cloud_1 = require("./cloud");
exports.customer = {
    customer: null,
    game: null
};
exports.validateCloudAbility = () => {
    if (!exports.customer.customer ||
        !exports.customer.customer.license ||
        (exports.customer.customer.license.type !== 'enterprise' && exports.customer.customer.license.type !== 'professional')) {
        return false;
    }
    return !!exports.customer.game;
};
async function default_1() {
    const io = await socket_1.ioPromise;
    play_1.initGameConnection();
    __1.app.route('/api/auth').get(user.getCurrent).post(user.loginHandler).delete(user.logout);
    __1.app.route('/api/config').get(config.getConfig).patch(config.updateConfig);
    __1.app.route('/api/version').get((req, res) => res.json({ version: electron_1.app.getVersion() }));
    routes_1.default();
    routes_2.default();
    routes_3.default();
    routes_4.default();
    __1.app.route('/api/games/start/:game').get(async (req, res) => {
        const game = req.params.game;
        exports.customer.game = game;
        const result = await cloud_1.checkCloudStatus(game);
        res.json({ result });
    });
    __1.app.route('/api/cloud/upload')
        .post(async (req, res) => {
        const game = exports.customer.game;
        if (!game)
            return res.sendStatus(403);
        const result = await cloud_1.uploadLocalToCloud(game);
        return res.json({ result });
    });
    __1.app.route('/api/games/current').get((req, res) => res.json({ game: exports.customer.game }));
    __1.app.route('/api/huds').get(huds.getHUDs).post(huds.openHUDsDirectory).delete(huds.deleteHUD);
    __1.app.route('/api/huds/add').post(huds.uploadHUD);
    __1.app.route('/api/huds/close').post(huds.closeHUD);
    __1.app.route('/api/huds/:hudDir/start').post(huds.showHUD);
    __1.app.route('/api/gsi').get(gsi.checkGSIFile).put(gsi.createGSIFile);
    __1.app.route('/api/import').post(sync.importDb);
    __1.app.route('/api/steam').get((req, res) => res.json({ gamePath: steam_game_path_1.getGamePath(730) }));
    __1.app.route('/api/import/verify').post(sync.checkForConflicts);
    __1.app.route('/api/gsi/download').get(gsi.saveFile('gamestate_integration_hudmanager.cfg', gsi.generateGSIFile()));
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
    __1.app.use('/dev', huds.verifyOverlay, http_proxy_middleware_1.createProxyMiddleware({ target: 'http://localhost:3500', ws: true, logLevel: 'silent' }));
    __1.app.route('/api/machine').get(machine.getMachineIdRoute);
    __1.app.use('/huds/:dir/', huds.renderAssets);
    __1.app.route('/huds/:dir/thumbnail').get(huds.renderThumbnail);
    electron_1.globalShortcut.register('Alt+Shift+F', () => io.emit('refreshHUD'));
    electron_1.globalShortcut.register('Alt+R', match.reverseSide);
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
