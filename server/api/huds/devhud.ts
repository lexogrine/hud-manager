import portscanner from 'portscanner';
import { loadConfig, internalIP } from '../config';
import { HUDState, ioPromise, runtimeConfig } from '../../socket';
import * as I from '../../../types/interfaces';
import { HUDStateManager } from './hudstatemanager';
import fetch from 'node-fetch';

class DevHUDListener {
	port: number;
	status: boolean;
	interval: any;
	callback: (status: boolean) => void;
	constructor(port: number) {
		this.port = port;
		this.status = false;
		this.callback = () => {};
		this.interval = -1;
	}
	onChange(callback: (status: boolean) => void) {
		this.callback = callback;
	}
	checkPort = () => {
		portscanner.checkPortStatus(this.port, '127.0.0.1', (err, portStatus) => {
			const status = portStatus === 'open';
			if (status !== this.status) {
				this.callback(status);
			}
			this.status = status;
		});
		/**/
	};
	start() {
		if (this.interval !== -1) return;
		const id = setInterval(this.checkPort, 3000);
		this.interval = id;
	}
	stop() {
		clearInterval(this.interval);
	}
}

const getJSONArray: <T>(url: string) => Promise<T[]> = url => {
	return fetch(url)
		.then(res => res.json())
		.then(panel => {
			try {
				if (!panel) return [];
				if (!Array.isArray(panel)) return [];
				return panel;
			} catch {
				return [];
			}
		})
		.catch(() => []);
};

const portListener = new DevHUDListener(3500);

portListener.onChange(async status => {
	const io = await ioPromise;
	if (!status) {
		HUDState.devHUD = null;
		return io.emit('reloadHUDs');
	}
	if (HUDState.devHUD) return;
	fetch('http://localhost:3500/dev/hud.json')
		.then(res => res.json())
		.then(async (hud: I.HUD) => {
			try {
				if (!hud) return;
				if (!hud || !hud.version || !hud.author) return;
				hud.keybinds = await getJSONArray('http://localhost:3500/dev/keybinds.json');
				hud.panel = await getJSONArray('http://localhost:3500/dev/panel.json');
				hud.isDev = true;
				hud.dir = (Math.random() * 1000 + 1)
					.toString(36)
					.replace(/[^a-z]+/g, '')
					.substr(0, 15);
				const cfg = await loadConfig();
				if (!cfg) {
					return;
				}
				hud.url = `http://localhost:${cfg.port}/development/`;
				HUDState.devHUD = hud;
				if (runtimeConfig.devSocket) {
					const hudData = HUDState.get(hud.dir);
					const extended = await HUDStateManager.extend(hudData);
					io.to(hud.dir).emit('hud_config', extended);
				}
			} catch {}
			io.emit('reloadHUDs');
		})
		.catch(() => {
			return io.emit('reloadHUDs');
		});
});
portListener.start();
