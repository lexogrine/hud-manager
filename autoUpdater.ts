import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain, Notification, app } from 'electron';

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

export default (window: BrowserWindow) => {
	const version = app.getVersion();
	autoUpdater.on('update-available', () => {
		window.webContents.send('updateStatus', true, version);
		const notification = new Notification({
			title: 'Update available',
			body: `You can install the newest Lexogrine HUD Manager update in the Settings tab`
		});
		notification.on('click', () => {
			window.webContents.send('switchTab', 'settings');
		});
		notification.show();
	});
	autoUpdater.on('update-not-available', () => {
		window.webContents.send('updateStatus', false, version);
	});

	autoUpdater.on('update-downloaded', () => autoUpdater.quitAndInstall(true, true));

	ipcMain.on('updateApp', () => {
		autoUpdater.downloadUpdate();
	});

	ipcMain.on('checkUpdate', () => {
		autoUpdater.checkForUpdates();
	});
};
