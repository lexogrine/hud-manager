"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nedb_1 = __importDefault(require("nedb"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const directory = path_1.default.join(electron_1.app.getPath('userData'), 'databases');
const databases = {
    players: new nedb_1.default({ filename: path_1.default.join(directory, 'players'), autoload: true }),
    teams: new nedb_1.default({ filename: path_1.default.join(directory, 'teams'), autoload: true }),
    config: new nedb_1.default({ filename: path_1.default.join(directory, 'config'), autoload: true }),
    matches: new nedb_1.default({ filename: path_1.default.join(directory, 'matches'), autoload: true }),
    custom: new nedb_1.default({ filename: path_1.default.join(directory, 'custom'), autoload: true }),
    tournaments: new nedb_1.default({ filename: path_1.default.join(directory, 'tournaments'), autoload: true })
};
const testPlayers = [
    {
        firstName: 'Hubert',
        lastName: 'Walczak',
        username: '0sh10',
        avatar: '',
        country: 'PL',
        steamid: '123456789',
        team: '',
        extra: {}
    },
    {
        firstName: 'Michał',
        lastName: 'Majka',
        username: 'esterling',
        avatar: '',
        country: 'US',
        steamid: '1234567891',
        team: '',
        extra: {}
    },
    {
        firstName: 'Kacper',
        lastName: 'Herchel',
        username: 'kacperski1',
        avatar: '',
        country: 'UK',
        steamid: '1234567894',
        team: '',
        extra: {}
    }
];
databases.players.find({}, (err, player) => {
    if (player.length)
        return;
    databases.players.insert(testPlayers, (err, doc) => { });
});
exports.default = databases;
