"use strict";
exports.__esModule = true;
var electron_updater_1 = require("electron-updater");
var electron_1 = require("electron");
electron_updater_1.autoUpdater.autoDownload = false;
electron_updater_1.autoUpdater.autoInstallOnAppQuit = false;
exports["default"] = (function (window) {
    electron_updater_1.autoUpdater.on('update-available', function () {
        window.webContents.send('updateStatus', true);
    });
    electron_updater_1.autoUpdater.on('update-not-available', function () {
        window.webContents.send('updateStatus', false);
    });
    electron_updater_1.autoUpdater.on('update-downloaded', function () { return electron_updater_1.autoUpdater.quitAndInstall(true, true); });
    electron_1.ipcMain.on('updateApp', function () {
        electron_updater_1.autoUpdater.downloadUpdate();
    });
    electron_1.ipcMain.on('checkUpdate', function () {
        electron_updater_1.autoUpdater.checkForUpdates();
    });
});
