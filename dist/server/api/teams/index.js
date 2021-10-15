"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceLocalTeams = exports.addTeams = exports.getTeamsList = exports.getTeamById = void 0;
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
const getTeamsList = (query) => new Promise(res => {
    teams.find(query, (err, teams) => {
        if (err) {
            return res([]);
        }
        return res([...teams].sort((a, b) => (a.name > b.name ? 1 : -1)));
    });
});
exports.getTeamsList = getTeamsList;
const addTeams = (newTeams) => {
    return new Promise((res) => {
        teams.insert(newTeams, (err, docs) => {
            if (err)
                return res(null);
            return res(docs);
        });
    });
};
exports.addTeams = addTeams;
const replaceLocalTeams = (newTeams, game, existing) => new Promise(res => {
    const or = [
        { game, _id: { $nin: existing } },
        { game, _id: { $in: newTeams.map(team => team._id) } }
    ];
    if (game === 'csgo') {
        or.push({ game: { $exists: false }, _id: { $nin: existing } }, { game: { $exists: false }, _id: { $in: newTeams.map(team => team._id) } });
    }
    teams.remove({ $or: or }, { multi: true }, err => {
        if (err) {
            return res(false);
        }
        teams.insert(newTeams, (err, docs) => {
            return res(!err);
        });
    });
});
exports.replaceLocalTeams = replaceLocalTeams;
