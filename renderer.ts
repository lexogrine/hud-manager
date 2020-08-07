import { app, BrowserWindow, shell, session } from 'electron';
import path from 'path';
import fs from 'fs';
import { loadConfig } from './server/api/config';

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
		height: 835,
		show: false,
		frame: false,
		titleBarStyle: 'hidden',
		//resizable: isDev,
		title: 'HUD Manager',
		icon: path.join(__dirname, 'assets/icon.png'),
		webPreferences: {
			nodeIntegration: true,
			backgroundThrottling: false,
			devTools: isDev || forceDev
		},
		minWidth: 775,
		minHeight: 835,
		width: 1010
	});

	win.once('ready-to-show', () => {
		if (win) {
			win.show();
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
	win.on('close', () => {
		win = null;
		app.quit();
	});
};
