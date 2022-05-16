import { BrowserWindow, Tray, Menu /*globalShortcut*/ } from 'electron';
import { getHUDData } from './../server/api/huds';
import * as path from 'path';
//import ip from 'ip';
import socketio from 'socket.io';
import * as I from './../types/interfaces';
import { GSI, ioPromise, mirvPgl } from '../server/socket';
import { registerKeybind, unregisterKeybind } from '../server/api/keybinder';
import { CSGO, CSGORaw } from 'csgogsi-socket';

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
		const hud = await getHUDData(dirName, dirName === 'premiumhud');
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
				backgroundThrottling: false,
				preload: path.join(__dirname, 'preload.js')
			}
		});
		if (!hud.allowAppsOnTop) {
			hudWindow.on('show', () => {
				hudWindow.setAlwaysOnTop(true);
			});
			hudWindow.setIgnoreMouseEvents(true);
		}

		const onData = (data: CSGORaw) => {
			hudWindow.webContents.send('raw', data);
		};

		GSI.prependListener('raw', onData);

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
			GSI.off('raw', onData);
			if (this.hud && this.hud.keybinds) {
				for (const keybind of this.hud.keybinds) {
					unregisterKeybind(keybind.bind, hud.dir);
				}
			}
			unregisterKeybind('Left Alt+F');
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

		registerKeybind('Left Alt+F', () => {
			if (!this.current || !hud || !hud.url) return;
			this.current.loadURL(hud.url);
		});

		if (hud.keybinds) {
			for (const bind of hud.keybinds) {
				registerKeybind(
					bind.bind,
					() => {
						let action = '';
						let exec = '';

						if (typeof bind.action === 'string') {
							action = bind.action;
						} else if (Array.isArray(bind.action)) {
							if (!GSI.current?.map) return;
							const mapName = GSI.current.map.name.substr(GSI.current.map.name.lastIndexOf('/') + 1);
							const actionForMap = bind.action.find(keybindAction => keybindAction.map === mapName);

							if (actionForMap) {
								action =
									typeof actionForMap.action === 'string'
										? actionForMap.action
										: actionForMap.action.action || '';
								if (typeof actionForMap.action !== 'string') {
									exec = actionForMap.action.exec || '';
								}
							}
						} else {
							action = bind.action.action || '';
							exec = bind.action.exec || '';
						}
						if (action) io.to(hud.dir).emit('keybindAction', action);

						if (!exec) return;

						mirvPgl.execute(exec);
					},
					hud.dir
				);
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
