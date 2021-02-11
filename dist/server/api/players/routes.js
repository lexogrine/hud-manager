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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const P = __importStar(require("./middlewares"));
const initRoute = (router) => {
    router.route('/api/players').get(P.getPlayers).post(P.addPlayer);
    router.route('/api/players/fields').get(P.getFields).patch(P.updateFields);
    router.route('/api/players/:id').get(P.getPlayers).patch(P.updatePlayer).delete(P.deletePlayer);
    router.route('/api/players/avatar/:id').get(P.getAvatarFile);
    router.route('/api/players/avatar/steamid/:steamid').get(P.getAvatarURLBySteamID);
};
exports.default = initRoute;
