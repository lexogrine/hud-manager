import { app, BrowserWindow, shell, session, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import autoUpdater from './autoUpdater';
import ip from 'ip';
import { loadConfig, internalIP } from './server/api/config';

const isDev = process.env.DEV === 'true';

export const createMainWindow = async (forceDev = false) => {
	let win: BrowserWindow | null;

	const cookieFile = path.join(app.getPath('userData'), 'databases', 'cookie');

	const cookie = fs.readFileSync(cookieFile, 'utf8');
	try {
		const cookies = JSON.parse(cookie);
		if (Array.isArray(cookies)) {
			for (const cookie of cookies) {
				cookie.url = 'https://hmapi.lexogrine.com/';
				await session.defaultSession.cookies.set(cookie);
			}
		}
	} catch (e) {}

	process.on('message', msg => {
		if (msg === 'refocus' && win) {
			if (win.isMinimized()) win.restore();
			win.focus();
		}
	});

	if (app) {
		app.on('window-all-closed', app.quit);

		app.on('before-quit', async () => {
			const cookies = await session.defaultSession.cookies.get({ url: 'https://hmapi.lexogrine.com/' });

			fs.writeFileSync(cookieFile, JSON.stringify(cookies), 'utf8');

			if (!win) return;

			win.removeAllListeners('close');
			win.close();
		});
	}

	win = new BrowserWindow({
		height: 874,
		show: false,
		frame: false,
		titleBarStyle: 'hidden',
		//resizable: isDev,
		title: 'Lexogrine HUD Manager',
		icon: path.join(__dirname, 'assets/icon.png'),
		webPreferences: {
			nodeIntegration: true,
			backgroundThrottling: false,
			devTools: isDev || forceDev
		},
		minWidth: 950,
		minHeight: 874,
		width: 1200
	});

	ipcMain.on('min', () => {
		win.minimize();
	});

	ipcMain.on('max', () => {
		if (win.isMaximized()) {
			win.restore();
		} else {
			win.maximize();
		}
	});

	autoUpdater(win);

	ipcMain.on('close', () => {
		win.close();
	});

	win.once('ready-to-show', () => {
		if (win) {
			win.show();
		}
	});
	// win.setMenu(null);
	const config = await loadConfig();
	win.setMenuBarVisibility(false);
	const startUrl = `http://${internalIP}:${config.port}/`;

	win.webContents.on('new-window', (e, url) => {
		e.preventDefault();
		shell.openExternal(url);
	});

	win.loadURL(`${isDev ? `http://localhost:3000/?port=${config.port}` : startUrl}`);
	win.on('close', () => {
		win = null;
		app.quit();
	});
};
