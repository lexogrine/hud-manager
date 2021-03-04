import { verifyUrl } from "../api/config";
import { HUDStateManager } from "../api/huds/hudstatemanager";
import { reverseSide } from "../api/matches";
import { HUDState, ioPromise, runtimeConfig } from "../socket";

ioPromise.then(io => {
	io.on('connection', socket => {
		const ref = socket.request?.headers?.referer || '';
		verifyUrl(ref).then(status => {
			if (status) {
				socket.join('csgo');
			}
		});
		socket.on('started', () => {
			if (runtimeConfig.last) {
				socket.emit('update', runtimeConfig.last);
			}
		});
		socket.on('registerReader', () => {
			socket.on('readerKeybindAction', (dir: string, action: string) => {
				io.to(dir).emit('keybindAction', action);
			});
			socket.on('readerReverseSide', reverseSide);
		});
		socket.emit('readyToRegister');
		socket.on('register', async (name: string, isDev: boolean) => {
			if (!isDev) {
				socket.join(name);
				const hudData = HUDState.get(name, true);
				const extended = await HUDStateManager.extend(hudData);
				io.to(name).emit('hud_config', extended);
				return;
			}
			runtimeConfig.devSocket = socket;
			if (HUDState.devHUD) {
				socket.join(HUDState.devHUD.dir);
				const hudData = HUDState.get(HUDState.devHUD.dir);
				const extended = await HUDStateManager.extend(hudData);
				io.to(HUDState.devHUD.dir).emit('hud_config', extended);
			}
		});
		socket.on('hud_config', async (data: { hud: string; section: string; config: any }) => {
			HUDState.set(data.hud, data.section, data.config);
			const hudData = HUDState.get(data.hud);
			const extended = await HUDStateManager.extend(hudData);
			io.to(data.hud).emit('hud_config', extended);
		});
		socket.on('hud_action', (data: { hud: string; action: any }) => {
			io.to(data.hud).emit(`hud_action`, data.action);
		});
		socket.on('get_config', (hud: string) => {
			socket.emit('hud_config', HUDState.get(hud, true));
		});

		socket.on('set_active_hlae', (hudUrl: string | null) => {
			if (runtimeConfig.currentHUD === hudUrl) {
				runtimeConfig.currentHUD = null;
			} else {
				runtimeConfig.currentHUD = hudUrl;
			}
			io.emit('active_hlae', runtimeConfig.currentHUD);
		});

		socket.on('get_active_hlae', () => {
			io.emit('active_hlae', runtimeConfig.currentHUD);
		});
	});
});