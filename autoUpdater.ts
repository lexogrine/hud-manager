import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

export default (window: BrowserWindow) => {
	autoUpdater.on('update-available', () => {
		window.webContents.send('updateStatus', true);
	});
	autoUpdater.on('update-not-available', () => {
		window.webContents.send('updateStatus', false);
	});

	autoUpdater.on('update-downloaded', autoUpdater.quitAndInstall);

	ipcMain.on('updateApp', () => {
		autoUpdater.downloadUpdate();
	});

	ipcMain.on('checkUpdate', () => {
		autoUpdater.checkForUpdates();
	});
};
