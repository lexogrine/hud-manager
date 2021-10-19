"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudSize = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const getAmountOfBytesOfDatabases = () => {
    const directory = path_1.default.join(electron_1.app.getPath('userData'), 'databases');
    const files = ['players', 'teams', 'matches', 'tournaments', 'custom', 'aco'];
    let bytes = 0;
    for (const file of files) {
        bytes += fs_1.default.statSync(path_1.default.join(directory, file)).size;
    }
    return bytes;
};
const getCloudSize = async (req, res) => {
    return res.json({ size: getAmountOfBytesOfDatabases() });
};
exports.getCloudSize = getCloudSize;
