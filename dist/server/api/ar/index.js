"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAR = exports.listARModules = exports.getARModuleData = exports.getARPanelSetting = exports.getARKeyBinds = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const __1 = require("..");
const huds_1 = require("../huds");
const v4_1 = __importDefault(require("uuid/v4"));
const DecompressZip = require('decompress-zip');
const getARKeyBinds = (dirName) => {
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
exports.getARKeyBinds = getARKeyBinds;
const getARPanelSetting = (dirName) => {
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
exports.getARPanelSetting = getARPanelSetting;
const getARModuleData = (directory) => {
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
exports.getARModuleData = getARModuleData;
const filterValidARModules = (ar) => {
    if (!ar || !ar.game || !ar.entry || !ar.name || !ar.dir || ar.game !== __1.customer.game)
        return false;
    const entryPath = path_1.default.join(electron_1.app.getPath('userData'), 'ARs', ar.dir, ar.entry);
    return fs_1.default.existsSync(entryPath);
};
const listARModules = () => {
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
exports.listARModules = listARModules;
async function loadAR(base64, name, existingUUID) {
    huds_1.removeArchives();
    return new Promise(res => {
        let arDirName = name.replace(/[^a-zA-Z0-9-_]/g, '');
        let arPath = path_1.default.join(electron_1.app.getPath('userData'), 'ARs', arDirName);
        if (fs_1.default.existsSync(arPath)) {
            arDirName = `${arDirName}-${huds_1.getRandomString()}`;
            arPath = path_1.default.join(electron_1.app.getPath('userData'), 'ARs', arDirName);
        }
        try {
            const fileString = base64.split(';base64,').pop();
            if (!fileString) {
                throw new Error();
            }
            const tempArchiveName = `./ar_temp_archive_${huds_1.getRandomString()}.zip`;
            fs_1.default.writeFileSync(tempArchiveName, fileString, { encoding: 'base64', mode: 777 });
            const tempUnzipper = new DecompressZip(tempArchiveName);
            tempUnzipper.on('extract', async () => {
                if (fs_1.default.existsSync(path_1.default.join(arPath, 'ar.json'))) {
                    const arData = await exports.getARModuleData(path_1.default.basename(arPath));
                    if (!arData || !arData.name) {
                        throw new Error();
                    }
                    huds_1.removeArchives();
                    fs_1.default.writeFileSync(path_1.default.join(arPath, 'uuid.lhm'), existingUUID || v4_1.default(), 'utf8');
                    res(arData);
                }
                else {
                    throw new Error();
                }
            });
            tempUnzipper.on('error', () => {
                if (fs_1.default.existsSync(arPath)) {
                    huds_1.remove(arPath);
                }
                huds_1.removeArchives();
                res(null);
            });
            tempUnzipper.extract({
                path: arPath
            });
            /**/
        }
        catch {
            if (fs_1.default.existsSync(arPath)) {
                huds_1.remove(arPath);
            }
            huds_1.removeArchives();
            res(null);
        }
    });
}
exports.loadAR = loadAR;
