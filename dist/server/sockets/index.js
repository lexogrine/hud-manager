"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../api/config");
const hudstatemanager_1 = require("../api/huds/hudstatemanager");
const matches_1 = require("../api/matches");
const socket_1 = require("../socket");
const play_1 = require("./../api/huds/play");
const interfaces_1 = require("../../types/interfaces");
const keybinder_1 = require("../api/keybinder");
const huds_1 = require("../api/huds");
const huds_2 = require("../../init/huds");
const ar_1 = require("../api/ar");
let activeModuleDirs = [];
socket_1.ioPromise.then(io => {
    io.on('connection', socket => {
        const ref = socket.request?.headers?.referer || '';
        (0, config_1.verifyUrl)(ref).then(status => {
            if (status) {
                socket.join('game');
            }
        });
        socket.on('started', () => {
            if (socket_1.runtimeConfig.last) {
                socket.emit('update', socket_1.runtimeConfig.last, socket_1.GSI.damage);
            }
        });
        socket.on('registerReader', () => {
            socket.on('readerKeybindAction', (dir, action) => {
                io.to(dir).emit('keybindAction', action);
            });
            socket.on('readerReverseSide', matches_1.reverseSide);
        });
        socket.emit('readyToRegister');
        socket.on('disconnect', () => {
            socket_1.runtimeConfig.devSocket = socket_1.runtimeConfig.devSocket.filter(devSocket => devSocket !== socket);
        });
        socket.on('unregister', () => {
            socket.rooms.forEach(roomName => {
                if (roomName === socket.id || interfaces_1.availableGames.includes(roomName) || roomName === 'game')
                    return;
                socket.leave(roomName);
            });
        });
        socket.on('register', async (name, isDev, game = 'csgo', mode) => {
            if (mode === 'IPC') {
                socket.join("IPC");
            }
            if (!isDev || socket_1.HUDState.devHUD) {
                socket.on('hud_inner_action', (action) => {
                    io.to(isDev && socket_1.HUDState.devHUD ? socket_1.HUDState.devHUD.dir : name).emit(`hud_action`, action);
                });
            }
            socket.join(game);
            if (!isDev) {
                socket.join(name);
                const hudData = socket_1.HUDState.get(name, true);
                const extended = await hudstatemanager_1.HUDStateManager.extend(hudData);
                io.to(name).emit('hud_config', extended);
                return;
            }
            socket_1.runtimeConfig.devSocket.push(socket);
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
        socket.on('set_active_hlae', async (hudUrl, dir, isDev) => {
            if (socket_1.runtimeConfig.currentHUD.url === hudUrl) {
                socket_1.runtimeConfig.currentHUD.url = null;
                socket_1.runtimeConfig.currentHUD.isDev = false;
                socket_1.runtimeConfig.currentHUD.dir = '';
                (0, keybinder_1.unregisterAllKeybinds)(dir);
            }
            else {
                if (hudUrl) {
                    const hudData = await (0, huds_1.getHUDData)(dir, dir === 'premiumhud');
                    const keybinds = hudData?.keybinds || [];
                    for (const bind of keybinds) {
                        (0, keybinder_1.registerKeybind)(bind.bind, () => {
                            let action = '';
                            let exec = '';
                            if (typeof bind.action === 'string') {
                                action = bind.action;
                            }
                            else if (Array.isArray(bind.action)) {
                                if (!socket_1.GSI.current?.map)
                                    return;
                                const mapName = socket_1.GSI.current.map.name.substr(socket_1.GSI.current.map.name.lastIndexOf('/') + 1);
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
                            }
                            else {
                                action = bind.action.action || '';
                                exec = bind.action.exec || '';
                            }
                            if (action)
                                io.to(dir).emit('keybindAction', action);
                            if (!exec)
                                return;
                            socket_1.mirvPgl.execute(exec);
                        }, dir);
                    }
                }
                else if (socket_1.runtimeConfig.currentHUD.dir) {
                    (0, keybinder_1.unregisterAllKeybinds)(socket_1.runtimeConfig.currentHUD.dir);
                }
                socket_1.runtimeConfig.currentHUD.url = hudUrl;
                socket_1.runtimeConfig.currentHUD.isDev = isDev;
                socket_1.runtimeConfig.currentHUD.dir = dir;
            }
            io.emit('active_hlae', hudUrl, dir, isDev);
        });
        socket.on('get_active_hlae_hud', () => {
            const { url, dir, isDev } = socket_1.runtimeConfig.currentHUD;
            io.emit('active_hlae', url, dir, isDev);
        });
        socket.on('get_test_settings', () => {
            socket.emit('enableTest', !play_1.playTesting.intervalId, play_1.playTesting.isOnLoop);
        });
        socket.on('is_hud_opened', () => {
            socket.emit('hud_opened', !!huds_2.hudContext.huds.length);
        });
        socket.on('toggle_module', async (moduleDir) => {
            if (activeModuleDirs.includes(moduleDir)) {
                activeModuleDirs = activeModuleDirs.filter(dir => dir !== moduleDir);
                (0, keybinder_1.unregisterAllKeybinds)(moduleDir);
            }
            else {
                const ar = await (0, ar_1.getARModuleData)(moduleDir);
                if (!ar) {
                    return;
                }
                for (const bind of ar.keybinds) {
                    (0, keybinder_1.registerKeybind)(bind.bind, () => {
                        let action = '';
                        let exec = '';
                        if (typeof bind.action === 'string') {
                            action = bind.action;
                        }
                        else if (Array.isArray(bind.action)) {
                            if (!socket_1.GSI.current?.map)
                                return;
                            const mapName = socket_1.GSI.current.map.name.substr(socket_1.GSI.current.map.name.lastIndexOf('/') + 1);
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
                        }
                        else {
                            action = bind.action.action || '';
                            exec = bind.action.exec || '';
                        }
                        if (action)
                            io.emit('keybindAction', action);
                        if (!exec)
                            return;
                        socket_1.mirvPgl.execute(exec);
                    }, moduleDir);
                }
                activeModuleDirs.push(moduleDir);
            }
            io.emit('active_modules', activeModuleDirs);
        });
        socket.on('get_active_modules', () => {
            socket.emit('active_modules', activeModuleDirs);
        });
    });
});
