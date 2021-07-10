import { BrowserWindow, Tray, Menu, /*globalShortcut*/ } from 'electron';
import { getHUDData } from './../server/api/huds';
import * as path from 'path';
//import ip from 'ip';
import socketio from 'socket.io';
import * as I from './../types/interfaces';
import { ioPromise } from '../server/socket';
import { registerKeybind, unregisterKeybind } from '../server/api/keybinder';

class HUD {
	current: BrowserWindow | null;
	tray: Tray | null;
	show: boolean;
	hud: I.HUD | null;
	constructor() {
		this.current = null;
		this.tray = null;
		this.show = true;
		this.hud = null;
	}

	async open(dirName: string) {
		const io = await ioPromise;
		if (this.current !== null || this.hud !== null) return null;
		const hud = await getHUDData(dirName);
		if (hud === null) return null;
		const hudWindow = new BrowserWindow({
			fullscreen: true,
			show: false,
			title: hud.name,
			resizable: false,
			alwaysOnTop: !hud.allowAppsOnTop,
			frame: false,
			transparent: true,
			focusable: true,
			webPreferences: {
				backgroundThrottling: false
			}
		});
		if (!hud.allowAppsOnTop) {
			hudWindow.on('show', () => {
				hudWindow.setAlwaysOnTop(true);
			});
			hudWindow.setIgnoreMouseEvents(true);
		}

		const tray = new Tray(path.join(__dirname, 'favicon.ico'));

		tray.setToolTip('Lexogrine HUD Manager');
		tray.on('right-click', () => {
			const contextMenu = Menu.buildFromTemplate([
				{ label: hud.name, enabled: false },
				{ type: 'separator' },
				{ label: 'Show', type: 'checkbox', click: () => this.toggleVisibility(), checked: this.show },
				{ label: 'Close HUD', click: () => this.close() }
			]);
			tray.popUpContextMenu(contextMenu);
		});

		this.tray = tray;

		this.current = hudWindow;
		this.hud = hud;
		
		io.emit('hud_opened', true);

		this.showWindow(hud, io);
		hudWindow.loadURL(hud.url);

		hudWindow.on('close', () => {
			if (this.hud && this.hud.keybinds) {
				for (const keybind of this.hud.keybinds) {
					//globalShortcut.unregister(keybind.bind);
					unregisterKeybind(keybind.bind, hud.dir);
				}
			}
			unregisterKeybind("Alt+F");
			// globalShortcut.unregister('Alt+F');

			this.hud = null;
			this.current = null;
			io.emit('hud_opened', false);
			if (this.tray !== null) {
				this.tray.destroy();
			}
		});

		return true;
	}

	showWindow(hud: I.HUD, io: socketio.Server) {
		if (!this.current) return;
		this.current.setOpacity(1);
		this.current.show();

		/*globalShortcut.register('Alt+F', () => {
			if (!this.current || !hud || !hud.url) return;
			this.current.loadURL(hud.url);
		});*/

		registerKeybind("Alt+F", () => {
			if (!this.current || !hud || !hud.url) return;
			this.current.loadURL(hud.url);
		});

		if (hud.keybinds) {
			for (const bind of hud.keybinds) {
				registerKeybind(bind.bind, () => {
					io.to(hud.dir).emit('keybindAction', bind.action);
				}, hud.dir);
				/*globalShortcut.register(bind.bind, () => {
					io.to(hud.dir).emit('keybindAction', bind.action);
				});*/
			}
		}
	}

	toggleVisibility() {
		this.show = !this.show;
		if (this.current) {
			this.current.setOpacity(this.show ? 1 : 0);
		}
	}

	async close() {
		const io = await ioPromise;
		if (this.tray !== null) {
			this.tray.destroy();
		}
		if (this.current === null) return null;

		this.current.close();
		this.current = null;
		io.emit('hud_opened', false);

		return true;
	}
}

const HUDWindow = new HUD();

export default HUDWindow;
