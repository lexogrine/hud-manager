"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceLocalTeams = exports.addTeams = exports.getTeamsList = exports.getTeamById = void 0;
const database_1 = require("./../../../init/database");
async function getTeamById(id, logo = false) {
    return new Promise(res => {
        if (!database_1.databaseContext.databases.teams)
            return res(null);
        database_1.databaseContext.databases.teams.findOne({ _id: id }, (err, team) => {
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
    if (!database_1.databaseContext.databases.teams)
        return res([]);
    database_1.databaseContext.databases.teams.find(query, (err, teams) => {
        if (err) {
            return res([]);
        }
        return res([...teams].sort((a, b) => (a.name > b.name ? 1 : -1)));
    });
});
exports.getTeamsList = getTeamsList;
const addTeams = (newTeams) => {
    return new Promise(res => {
        if (!database_1.databaseContext.databases.teams)
            return res(null);
        database_1.databaseContext.databases.teams.insert(newTeams, (err, docs) => {
            if (err)
                return res(null);
            return res(docs);
        });
    });
};
exports.addTeams = addTeams;
const replaceLocalTeams = (newTeams, game, existing) => new Promise(res => {
    if (!database_1.databaseContext.databases.teams)
        return res(false);
    const or = [
        { game, _id: { $nin: existing } },
        { game, _id: { $in: newTeams.map(team => team._id) } }
    ];
    if (game === 'csgo') {
        or.push({ game: { $exists: false }, _id: { $nin: existing } }, { game: { $exists: false }, _id: { $in: newTeams.map(team => team._id) } });
    }
    database_1.databaseContext.databases.teams.remove({ $or: or }, { multi: true }, err => {
        if (err) {
            return res(false);
        }
        database_1.databaseContext.databases.teams.insert(newTeams, (err, docs) => {
            return res(!err);
        });
    });
});
exports.replaceLocalTeams = replaceLocalTeams;
