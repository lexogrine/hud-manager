"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listARModules = exports.getARModuleData = exports.getARPanelSetting = exports.getARKeyBinds = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const __1 = require("..");
exports.getARKeyBinds = (dirName) => {
    const dir = path_1.default.join(electron_1.app.getPath('userData'), 'ARs', dirName);
    const keybindsFileDir = path_1.default.join(dir, 'keybinds.json');
    if (!fs_1.default.existsSync(keybindsFileDir)) {
        return [];
    }
    try {
        const keybindsFile = fs_1.default.readFileSync(keybindsFileDir, { encoding: 'utf8' });
        const keybinds = JSON.parse(keybindsFile);
        return keybinds;
    }
    catch (e) {
        return [];
    }
};
exports.getARPanelSetting = (dirName) => {
    const dir = path_1.default.join(electron_1.app.getPath('userData'), 'ARs', dirName);
    const panelFileDir = path_1.default.join(dir, 'panel.json');
    if (!fs_1.default.existsSync(panelFileDir)) {
        return undefined;
    }
    try {
        const panelFile = fs_1.default.readFileSync(panelFileDir, { encoding: 'utf8' });
        const panel = JSON.parse(panelFile);
        return panel;
    }
    catch (e) {
        return undefined;
    }
};
exports.getARModuleData = (directory) => {
    const dir = path_1.default.join(electron_1.app.getPath('userData'), 'ARs', directory);
    const configFileDir = path_1.default.join(dir, 'ar.json');
    try {
        const configFile = fs_1.default.readFileSync(configFileDir, { encoding: 'utf8' });
        const config = JSON.parse(configFile);
        config.dir = directory;
        config.keybinds = exports.getARKeyBinds(directory);
        config.panel = exports.getARPanelSetting(directory);
        return config;
    }
    catch (e) {
        return null;
    }
};
const filterValidARModules = (ar) => {
    if (!ar || !ar.game || !ar.entry || !ar.name || !ar.dir || ar.game !== __1.customer.game)
        return false;
    const entryPath = path_1.default.join(electron_1.app.getPath('userData'), 'ARs', ar.dir, ar.entry);
    return fs_1.default.existsSync(entryPath);
};
exports.listARModules = () => {
    if (!__1.customer.game)
        return [];
    const dir = path_1.default.join(electron_1.app.getPath('userData'), 'ARs');
    const filtered = fs_1.default
        .readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .filter(dirent => /^[0-9a-zA-Z-_]+$/g.test(dirent.name))
        .map(dirent => dirent.name);
    const arModules = filtered.map(directory => exports.getARModuleData(directory)).filter(filterValidARModules);
    return arModules;
};
