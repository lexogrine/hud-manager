"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudSize = exports.getAmountOfBytesOfDatabases = void 0;
//import path from 'path';
//import fs from 'fs';
//import { app } from 'electron';
const database_1 = __importDefault(require("../../../init/database"));
const getAmountOfBytesOfDatabases = () => {
    const size = Object.values(database_1.default)
        .map(db => Buffer.byteLength(JSON.stringify(db.getAllData()), 'utf8'))
        .reduce((a, b) => a + b, 0);
    //const directory = path.join(app.getPath('userData'), 'databases');
    //const files = ['players', 'teams', 'matches', 'tournaments', 'custom', 'aco'];
    /*let bytes = 0;

    for (const file of files) {
        bytes += fs.statSync(path.join(directory, file)).size;
    }*/
    return size;
};
exports.getAmountOfBytesOfDatabases = getAmountOfBytesOfDatabases;
const getCloudSize = async (req, res) => {
    return res.json({ size: (0, exports.getAmountOfBytesOfDatabases)() });
};
exports.getCloudSize = getCloudSize;
