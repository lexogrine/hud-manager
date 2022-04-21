"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdvancedFXInstallation = exports.afxExecutable = exports.hlaeExecutable = exports.useIntegrated = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// import fetch from 'node-fetch';
const github_1 = require("./github");
const __1 = require("..");
const socket_1 = require("../../socket");
const userData = electron_1.app.getPath('userData');
const useIntegratedSettingsPath = path_1.default.join(userData, 'integrated.lhm');
const wait = (ms) => new Promise(r => setTimeout(r, ms));
exports.useIntegrated = false;
fs_1.default.promises.readFile(useIntegratedSettingsPath, 'utf-8').then(content => {
    exports.useIntegrated = content === 'true';
}).catch(() => { });
exports.hlaeExecutable = path_1.default.join(userData, 'hlae', 'HLAE.exe');
exports.afxExecutable = path_1.default.join(userData, 'afx', 'Release', 'afx-cefhud-interop.exe');
let useIntegratedUpdater = null;
const updateUseIntegrated = (newUseIntegrated, win) => {
    const getIntegratedUpdate = async () => {
        await wait(100);
        return fs_1.default.promises.writeFile(useIntegratedSettingsPath, newUseIntegrated ? 'true' : 'false').then(() => {
            exports.useIntegrated = newUseIntegrated;
            win.webContents.send('usePreinstalled', newUseIntegrated);
            useIntegratedUpdater = null;
        });
    };
    if (!useIntegratedUpdater) {
        useIntegratedUpdater = getIntegratedUpdate();
        return;
    }
    useIntegratedUpdater = useIntegratedUpdater.then(getIntegratedUpdate);
};
const findHLAEAsset = (asset) => {
    return asset.content_type === 'application/x-zip-compressed';
};
const findAFXAsset = (asset) => {
    return asset.name === 'Release.7z';
};
const verifyHLAEInstallation = (win) => (0, github_1.verifyInstallation)('advancedfx/advancedfx', path_1.default.join(userData, 'hlae'), findHLAEAsset, win).then(result => {
    console.log('HLAE INSTALLATION STAUTS', result);
});
const verifyAFXInstallation = async (win) => {
    /*const releases = (await fetch('https://api.github.com/repos/advancedfx/afx-cefhud-interop/releases').then(res =>
        res.json()
    )) as components['schemas']['release'][];
    const latestReleaseWithExecutable = releases.find(release => release.assets.find(findAFXAsset));
    if (!latestReleaseWithExecutable) {
        console.log('No AFX executables found');
        return;
    }*/
    return (0, github_1.verifyInstallation)('advancedfx/afx-cefhud-interop', path_1.default.join(userData, 'afx'), findAFXAsset, win, 'v7.0.0.17-4dcfd4d').then(result => {
        console.log('AFX INSTALLATION STATUS', result);
    });
};
const verifyAdvancedFXInstallation = async (win) => {
    __1.hlaeEmitter.on("hlaeStatus", (status) => {
        win.webContents.send('hlaeStatus', status);
    });
    electron_1.ipcMain.on('getHlaeStatus', ev => {
        ev.reply('hlaeStatus', !!socket_1.mirvPgl.socket);
    });
    electron_1.ipcMain.on('getPreinstalled', ev => {
        ev.reply('usePreinstalled', exports.useIntegrated);
    });
    electron_1.ipcMain.on('setUsePreinstalled', (_ev, newUseIntegrated) => {
        updateUseIntegrated(newUseIntegrated, win);
    });
    electron_1.ipcMain.on('getAfxVersion', ev => {
        ev.reply('advancedFxVersion', 'afx', (0, github_1.getAssetVersion)(path_1.default.join(userData, 'afx')));
    });
    electron_1.ipcMain.on('getHlaeVersion', ev => {
        ev.reply('advancedFxVersion', 'hlae', (0, github_1.getAssetVersion)(path_1.default.join(userData, 'hlae')));
    });
    await verifyHLAEInstallation(win);
    await verifyAFXInstallation(win);
};
exports.verifyAdvancedFXInstallation = verifyAdvancedFXInstallation;
