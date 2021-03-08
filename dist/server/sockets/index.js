"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../api/config");
const hudstatemanager_1 = require("../api/huds/hudstatemanager");
const matches_1 = require("../api/matches");
const socket_1 = require("../socket");
const play_1 = require("./../api/huds/play");
socket_1.ioPromise.then(io => {
    io.on('connection', socket => {
        const ref = socket.request?.headers?.referer || '';
        config_1.verifyUrl(ref).then(status => {
            if (status) {
                socket.join('csgo');
            }
        });
        socket.on('started', () => {
            if (socket_1.runtimeConfig.last) {
                socket.emit('update', socket_1.runtimeConfig.last);
            }
        });
        socket.on('registerReader', () => {
            socket.on('readerKeybindAction', (dir, action) => {
                io.to(dir).emit('keybindAction', action);
            });
            socket.on('readerReverseSide', matches_1.reverseSide);
        });
        socket.emit('readyToRegister');
        socket.on('register', async (name, isDev) => {
            if (!isDev || socket_1.HUDState.devHUD) {
                socket.on('hud_inner_action', (action) => {
                    io.to(isDev && socket_1.HUDState.devHUD ? socket_1.HUDState.devHUD.dir : name).emit(`hud_action`, action);
                });
            }
            if (!isDev) {
                socket.join(name);
                const hudData = socket_1.HUDState.get(name, true);
                const extended = await hudstatemanager_1.HUDStateManager.extend(hudData);
                io.to(name).emit('hud_config', extended);
                return;
            }
            socket_1.runtimeConfig.devSocket = socket;
            if (socket_1.HUDState.devHUD) {
                socket.join(socket_1.HUDState.devHUD.dir);
                const hudData = socket_1.HUDState.get(socket_1.HUDState.devHUD.dir);
                const extended = await hudstatemanager_1.HUDStateManager.extend(hudData);
                io.to(socket_1.HUDState.devHUD.dir).emit('hud_config', extended);
            }
        });
        socket.on('hud_config', async (data) => {
            socket_1.HUDState.set(data.hud, data.section, data.config);
            const hudData = socket_1.HUDState.get(data.hud);
            const extended = await hudstatemanager_1.HUDStateManager.extend(hudData);
            io.to(data.hud).emit('hud_config', extended);
        });
        socket.on('hud_action', (data) => {
            io.to(data.hud).emit(`hud_action`, data.action);
        });
        socket.on('get_config', (hud) => {
            socket.emit('hud_config', socket_1.HUDState.get(hud, true));
        });
        socket.on('set_active_hlae', (hudUrl) => {
            if (socket_1.runtimeConfig.currentHUD === hudUrl) {
                socket_1.runtimeConfig.currentHUD = null;
            }
            else {
                socket_1.runtimeConfig.currentHUD = hudUrl;
            }
            io.emit('active_hlae', socket_1.runtimeConfig.currentHUD);
        });
        socket.on('get_active_hlae', () => {
            io.emit('active_hlae', socket_1.runtimeConfig.currentHUD);
        });
        socket.on('get_test_settings', () => {
            socket.emit('enableTest', !play_1.playTesting.intervalId, play_1.playTesting.isOnLoop);
        });
    });
});
