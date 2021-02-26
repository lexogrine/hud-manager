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
exports.checkForConflicts = exports.importDb = exports.exportDatabase = void 0;
const database_1 = __importDefault(require("./../../init/database"));
const players = __importStar(require("./players"));
const teams = __importStar(require("./teams"));
const { teams: teamsDb, players: playersDb } = database_1.default;
async function importPlayers(players) {
    return new Promise(res => {
        const playerIdList = players.map(player => ({ _id: player._id }));
        playersDb.remove({ $or: playerIdList }, { multi: true }, err => {
            if (err)
                return res([]);
            playersDb.insert(players, (err, newDocs) => {
                if (err)
                    return res([]);
                return res(newDocs);
            });
        });
    });
}
async function importTeams(teams) {
    return new Promise(res => {
        const teamIdList = teams.map(team => ({ _id: team._id }));
        teamsDb.remove({ $or: teamIdList }, { multi: true }, err => {
            if (err)
                return res([]);
            teamsDb.insert(teams, (err, newDocs) => {
                if (err)
                    return res([]);
                return res(newDocs);
            });
        });
    });
}
async function exportDatabase() {
    const pl = new Promise(res => {
        playersDb.find({}, (err, players) => {
            if (err) {
                return res([]);
            }
            return res(players);
        });
    });
    const tm = new Promise(res => {
        teamsDb.find({}, (err, teams) => {
            if (err) {
                return res([]);
            }
            return res(teams);
        });
    });
    const result = await Promise.all([pl, tm]);
    const response = {
        teams: result[1],
        players: result[0]
    };
    return JSON.stringify(response);
}
exports.exportDatabase = exportDatabase;
const importDb = async (req, res) => {
    const db = req.body;
    if (!db || !db.players || !db.teams)
        return res.sendStatus(422);
    try {
        await Promise.all([importPlayers(db.players), importTeams(db.teams)]);
        return res.sendStatus(200);
    }
    catch {
        return res.sendStatus(500);
    }
};
exports.importDb = importDb;
const checkForConflicts = async (req, res) => {
    const db = req.body;
    if (!db || !db.teams || !db.players)
        return res.sendStatus(422);
    const teamIdList = db.teams.map(team => ({ _id: team._id }));
    const playerIdList = db.players.map(player => ({ _id: player._id }));
    try {
        const result = await Promise.all([
            players.getPlayersList({ $or: playerIdList }),
            teams.getTeamsList({ $or: teamIdList })
        ]);
        return res.json({
            players: result[0].length,
            teams: result[1].length
        });
    }
    catch {
        return res.sendStatus(500);
    }
};
exports.checkForConflicts = checkForConflicts;
