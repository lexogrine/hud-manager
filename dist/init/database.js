"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var nedb_1 = __importDefault(require("nedb"));
var path_1 = __importDefault(require("path"));
var electron_1 = require("electron");
var directory = path_1["default"].join(electron_1.app.getPath('userData'), 'databases');
exports["default"] = {
    players: new nedb_1["default"]({ filename: path_1["default"].join(directory, 'players'), autoload: true }),
    teams: new nedb_1["default"]({ filename: path_1["default"].join(directory, 'teams'), autoload: true }),
    config: new nedb_1["default"]({ filename: path_1["default"].join(directory, 'config'), autoload: true }),
    matches: new nedb_1["default"]({ filename: path_1["default"].join(directory, 'matches'), autoload: true }),
    custom: new nedb_1["default"]({ filename: path_1["default"].join(directory, 'custom'), autoload: true }),
    tournaments: new nedb_1["default"]({ filename: path_1["default"].join(directory, 'tournaments'), autoload: true })
};
