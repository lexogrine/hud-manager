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
exports.default = databases;
