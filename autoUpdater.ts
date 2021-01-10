import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain, Notification } from 'electron';

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

export default (window: BrowserWindow) => {
	autoUpdater.on('update-available', () => {
		window.webContents.send('updateStatus', true);
		const notification = new Notification({
			title: 'Update available',
			body: `You can install the newest Lexogrine HUD Manager update in the Settings tab`
		});
		notification.show();
	});
	autoUpdater.on('update-not-available', () => {
		window.webContents.send('updateStatus', false);
	});

	autoUpdater.on('update-downloaded', () => autoUpdater.quitAndInstall(true, true));

	ipcMain.on('updateApp', () => {
		autoUpdater.downloadUpdate();
	});

	ipcMain.on('checkUpdate', () => {
		autoUpdater.checkForUpdates();
	});
};
