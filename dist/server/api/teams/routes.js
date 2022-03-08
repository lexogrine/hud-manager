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
const T = __importStar(require("./middlewares"));
const user_1 = require("../user");
const initRoute = () => {
    __1.app.route('/api/teams').get(user_1.verifyGame, T.getTeams).post(user_1.verifyGame, T.addTeam);
    __1.app.route('/api/teams/import').post(user_1.verifyGame, T.addTeamsWithExcel);
    __1.app.route('/api/teams/fields').get(T.getFields).patch(T.updateFields);
    __1.app.route('/api/teams/:id').get(T.getTeam).patch(T.updateTeam).delete(T.deleteTeam);
    __1.app.route('/api/teams/logo/:id').get(T.getLogoFile);
};
exports.default = initRoute;
