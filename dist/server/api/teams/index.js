"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamsList = exports.getTeamById = void 0;
const database_1 = __importDefault(require("./../../../init/database"));
const { teams } = database_1.default;
async function getTeamById(id, logo = false) {
    return new Promise(res => {
        teams.findOne({ _id: id }, (err, team) => {
            if (err) {
                return res(null);
            }
            if (!logo && team && team.logo)
                team.logo = '';
            return res(team);
        });
    });
}
exports.getTeamById = getTeamById;
exports.getTeamsList = (query) => new Promise(res => {
    teams.find(query, (err, teams) => {
        if (err) {
            return res([]);
        }
        return res([...teams].sort((a, b) => a.name > b.name ? 1 : -1));
    });
});
