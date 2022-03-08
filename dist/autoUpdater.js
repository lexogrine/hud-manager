"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_updater_1 = require("electron-updater");
const electron_1 = require("electron");
electron_updater_1.autoUpdater.autoDownload = false;
electron_updater_1.autoUpdater.autoInstallOnAppQuit = false;
exports.default = (window) => {
    const version = electron_1.app.getVersion();
    electron_updater_1.autoUpdater.on('update-available', () => {
        window.webContents.send('updateStatus', true, version);
        const notification = new electron_1.Notification({
            title: 'Update available',
            body: `You can install the newest Lexogrine HUD Manager update in the Settings tab`
        });
        notification.on('click', () => {
            window.webContents.send('switchTab', 'settings');
        });
        notification.show();
    });
    electron_updater_1.autoUpdater.on('update-not-available', () => {
        window.webContents.send('updateStatus', false, version);
    });
    electron_updater_1.autoUpdater.on('update-downloaded', () => electron_updater_1.autoUpdater.quitAndInstall(true, true));
    electron_updater_1.autoUpdater.on('download-progress', event => { });
    electron_1.ipcMain.on('updateApp', () => {
        electron_updater_1.autoUpdater.downloadUpdate();
    });
    electron_1.ipcMain.on('checkUpdate', () => {
        electron_updater_1.autoUpdater.checkForUpdates();
    });
};
