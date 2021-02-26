"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMachineIdRoute = exports.getMachineId = void 0;
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const getMachineId = () => {
    const machinePathDirectory = path_1.default.join(electron_1.app.getPath('appData'), '.lexogrine');
    const machinePath = path_1.default.join(machinePathDirectory, 'machine.hm');
    const machineOldPath = path_1.default.join(electron_1.app.getPath('userData'), 'machine.hm');
    if (!fs_1.default.existsSync(machinePathDirectory)) {
        fs_1.default.mkdirSync(machinePathDirectory, { recursive: true });
    }
    let id = (Math.random() * 1000 + 1)
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 15);
    if (fs_1.default.existsSync(machinePath)) {
        id = fs_1.default.readFileSync(machinePath, 'UTF-8');
        return id;
    }
    if (fs_1.default.existsSync(machineOldPath)) {
        id = fs_1.default.readFileSync(machineOldPath, 'UTF-8');
        fs_1.default.renameSync(machineOldPath, machinePath);
        return id;
    }
    fs_1.default.writeFileSync(machinePath, id, { encoding: 'UTF-8' });
    return id;
};
exports.getMachineId = getMachineId;
const getMachineIdRoute = async (req, res) => {
    return res.json({ id: exports.getMachineId() });
};
exports.getMachineIdRoute = getMachineIdRoute;
