import { app, BrowserWindow, shell, ipcMain } from 'electron';
import EventEmitter from 'events';
import path from 'path';
import { Server } from 'http';
import autoUpdater from './autoUpdater';
import { loadConfig, internalIP } from './server/api/config';

const isDev = process.env.DEV === 'true';

export const processEvents = new EventEmitter();

export const createMainWindow = async (server: Server, forceDev = false) => {
	let win: BrowserWindow | null;

	processEvents.on('refocus', () => {
		if (win) {
			if (win.isMinimized()) win.restore();
			win.focus();
		}
	});

	/*if (app) {
		//app.on('window-all-closed', app.quit);

		app.on('before-quit', () => {
			if (!win) return;

			win.removeAllListeners('close');
			win.close();
		});
	}*/

	win = new BrowserWindow({
		height: 874,
		show: false,
		frame: false,
		titleBarStyle: 'hidden',
		//resizable: isDev,
		title: 'Lexogrine HUD Manager',
		icon: path.join(__dirname, 'assets/favicon.ico'),
		webPreferences: {
			nodeIntegration: true,
			backgroundThrottling: false,
			devTools: isDev || forceDev,
			preload: path.join(__dirname, 'preload.js')
		},
		minWidth: 740,
		minHeight: 440,
		width: 1200
	});

	ipcMain.on('min', () => {
		win?.minimize();
	});

	ipcMain.on('max', () => {
		if (win?.isMaximized()) {
			win?.restore();
		} else {
			win?.maximize();
		}
	});

	autoUpdater(win);

	ipcMain.on('close', () => {
		win?.close();
	});

	win.once('ready-to-show', () => {
		if (win) {
			win.show();
			win.webContents.openDevTools();
		}
	});
	// win.setMenu(null);
	const config = await loadConfig();
	win.setMenuBarVisibility(false);

	const startUrl = `http://localhost:${config.port}/`;

	win.webContents.on('new-window', (e, url) => {
		e.preventDefault();
		shell.openExternal(url);
	});

	win.loadURL(`${isDev ? `http://localhost:3000/?port=${config.port}` : startUrl}`);
	win.once('close', event => {
		event.preventDefault();
		win?.hide();
		win = null;
		server.emit('close-services');
		//app.quit();
	});
};
