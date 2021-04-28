import { verifyUrl } from '../api/config';
import { HUDStateManager } from '../api/huds/hudstatemanager';
import { reverseSide } from '../api/matches';
import { HUDState, ioPromise, runtimeConfig } from '../socket';
import { playTesting } from './../api/huds/play';
import { availableGames } from '../../types/interfaces';

ioPromise.then(io => {
	io.on('connection', socket => {
		const ref = socket.request?.headers?.referer || '';
		verifyUrl(ref).then(status => {
			if (status) {
				socket.join('game');
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
		socket.on('disconnect', () => {
			runtimeConfig.devSocket = runtimeConfig.devSocket.filter(devSocket => devSocket !== socket);
		});
		socket.on('unregister', () => {
			socket.rooms.forEach(roomName => {
				if (roomName === socket.id || availableGames.includes(roomName as any) || roomName === 'game') return;
				socket.leave(roomName);
			});
		});
		socket.on('register', async (name: string, isDev: boolean, game = 'csgo') => {
			if (!isDev || HUDState.devHUD) {
				socket.on('hud_inner_action', (action: any) => {
					io.to(isDev && HUDState.devHUD ? HUDState.devHUD.dir : name).emit(`hud_action`, action);
				});
			}
			socket.join(game);
			if (!isDev) {
				socket.join(name);
				const hudData = HUDState.get(name, true);
				const extended = await HUDStateManager.extend(hudData);
				io.to(name).emit('hud_config', extended);
				return;
			}
			runtimeConfig.devSocket.push(socket);
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

		socket.on('set_active_hlae', (hudUrl: string | null, dir: string, isDev: boolean) => {
			if (runtimeConfig.currentHUD.url === hudUrl) {
				runtimeConfig.currentHUD.url = null;
				runtimeConfig.currentHUD.isDev = false;
				runtimeConfig.currentHUD.dir = '';
			} else {
				runtimeConfig.currentHUD.url = hudUrl;
				runtimeConfig.currentHUD.isDev = isDev;
				runtimeConfig.currentHUD.dir = dir;
			}
			io.emit('active_hlae', hudUrl, dir, isDev);
		});

		socket.on('get_active_hlae_hud', () => {
			const { url, dir, isDev } = runtimeConfig.currentHUD;
			io.emit('active_hlae', url, dir, isDev);
		});

		socket.on('get_test_settings', () => {
			socket.emit('enableTest', !playTesting.intervalId, playTesting.isOnLoop);
		});
	});
});
