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
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const P = __importStar(require("./middlewares"));
const user_1 = require("../user");
const gamestate_1 = require("../gamestate");
const _1 = require(".");
const initRoute = () => {
    __1.app.route('/api/players').get(user_1.verifyGame, P.getPlayers).post(user_1.verifyGame, P.addPlayer);
    __1.app.route('/api/players/import').post(user_1.verifyGame, P.addPlayersWithExcel);
    __1.app.route('/api/players/export').post(user_1.verifyGame, (0, gamestate_1.saveFile)('player.xlsx', '', false, _1.exportPlayers));
    __1.app.route('/api/players/fields').get(P.getFields).patch(P.updateFields);
    __1.app.route('/api/players/:id').get(P.getPlayers).patch(P.updatePlayer).delete(P.deletePlayer);
    __1.app.route('/api/players/avatar/:id').get(P.getAvatarFile);
    __1.app.route('/api/players/avatar/steamid/:steamid').get(P.getAvatarURLBySteamID);
};
exports.default = initRoute;
