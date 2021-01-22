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
exports.__esModule = true;
exports.customer = void 0;
var express_1 = __importDefault(require("express"));
var electron_1 = require("electron");
var players = __importStar(require("./players"));
var steam_game_path_1 = require("steam-game-path");
var teams = __importStar(require("./teams"));
var match = __importStar(require("./match"));
var config = __importStar(require("./config"));
var huds = __importStar(require("./huds"));
var path = __importStar(require("path"));
var gsi = __importStar(require("./gamestate"));
var game = __importStar(require("./game"));
var sync = __importStar(require("./sync"));
var machine = __importStar(require("./machine"));
var user = __importStar(require("./user"));
var routes_1 = __importDefault(require("./tournaments/routes"));
exports.customer = {
    customer: null
};
function default_1(router, io) {
    router.route('/api/auth').get(user.getCurrent)["delete"](user.logout);
    router.route('/api/players').get(players.getPlayers).post(players.addPlayer);
    router.route('/api/players/:id').get(players.getPlayers).patch(players.updatePlayer)["delete"](players.deletePlayer);
    router.route('/api/players/avatar/:id').get(players.getAvatarFile);
    router.route('/api/players/avatar/steamid/:steamid').get(players.getAvatarURLBySteamID);
    router.route('/api/teams').get(teams.getTeams).post(teams.addTeam);
    router.route('/api/teams/:id').get(teams.getTeam).patch(teams.updateTeam)["delete"](teams.deleteTeam);
    router.route('/api/teams/logo/:id').get(teams.getLogoFile);
    router.route('/api/config').get(config.getConfig).patch(config.updateConfig(io));
    router.route('/api/version').get(function (req, res) { return res.json({ version: electron_1.app.getVersion() }); });
    router.route('/api/match').get(match.getMatchesRoute).post(match.addMatchRoute);
    router
        .route('/api/match/:id')
        //.get(teams.getTeam)
        .patch(match.updateMatchRoute(io))["delete"](match.deleteMatchRoute);
    routes_1["default"](router);
    router.route('/api/huds').get(huds.getHUDs).post(huds.openHUDsDirectory)["delete"](huds.deleteHUD(io));
    router.route('/api/huds/add').post(huds.uploadHUD);
    router.route('/api/huds/close').post(huds.closeHUD);
    router.route('/api/huds/:hudDir/start').post(huds.showHUD(io));
    router.route('/api/maps').get(match.getMaps);
    router.route('/api/gsi').get(gsi.checkGSIFile).put(gsi.createGSIFile);
    router.route('/api/import').post(sync.importDb);
    router.route('/api/steam').get(function (req, res) { return res.json({ gamePath: steam_game_path_1.getGamePath(730) }); });
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
    electron_1.globalShortcut.register('Alt+Shift+F', function () { return io.emit('refreshHUD'); });
    /**
     * LEGACY ROUTING
     */
    router.route('/legacy/:hudName/index.js').get(huds.legacyJS);
    router.route('/legacy/:hudName/style.css').get(huds.legacyCSS);
    router.use('/', express_1["default"].static(path.join(__dirname, '../static/legacy')));
    /**
     * END OF LEGACY ROUTING
     */
}
exports["default"] = default_1;
