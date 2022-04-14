"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const huds_1 = require("./../server/api/huds");
const path = __importStar(require("path"));
const socket_1 = require("../server/socket");
const keybinder_1 = require("../server/api/keybinder");
class HUD {
    current;
    tray;
    show;
    hud;
    constructor() {
        this.current = null;
        this.tray = null;
        this.show = true;
        this.hud = null;
    }
    async open(dirName) {
        const io = await socket_1.ioPromise;
        if (this.current !== null || this.hud !== null)
            return null;
        const hud = await (0, huds_1.getHUDData)(dirName, dirName === 'premiumhud');
        if (hud === null)
            return null;
        const hudWindow = new electron_1.BrowserWindow({
            fullscreen: true,
            show: false,
            title: hud.name,
            resizable: false,
            //alwaysOnTop: !hud.allowAppsOnTop,
            //frame: false,
            //transparent: true,
            //focusable: true,
            webPreferences: {
                backgroundThrottling: false,
                preload: path.join(__dirname, 'preload.js'),
            }
        });
        if (!hud.allowAppsOnTop) {
            hudWindow.on('show', () => {
                //hudWindow.setAlwaysOnTop(true);
            });
            //hudWindow.setIgnoreMouseEvents(true);
        }
        const onData = (data) => {
            console.log('?');
            hudWindow.webContents.send("raw", data);
        };
        socket_1.GSI.prependListener("raw", onData);
        const tray = new electron_1.Tray(path.join(__dirname, 'favicon.ico'));
        const sendTestS = () => {
            console.log(new Date().getTime());
            io.emit('speedtest');
        };
        const sendTestI = () => {
            console.log(new Date().getTime());
            hudWindow.webContents.send("speedtest");
        };
        tray.setToolTip('Lexogrine HUD Manager');
        tray.on('right-click', () => {
            const contextMenu = electron_1.Menu.buildFromTemplate([
                { label: hud.name, enabled: false },
                { type: 'separator' },
                { label: 'Show', type: 'checkbox', click: () => this.toggleVisibility(), checked: this.show },
                { label: 'Close HUD', click: () => this.close() },
                { label: 'SpeedtestS', click: () => sendTestS() },
                { label: 'SpeedtestI', click: () => sendTestI() }
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
            socket_1.GSI.off("raw", onData);
            if (this.hud && this.hud.keybinds) {
                for (const keybind of this.hud.keybinds) {
                    //globalShortcut.unregister(keybind.bind);
                    const keybinds = [];
                    if (Array.isArray(keybind.action)) {
                        keybinds.push(...keybind.action.map(ar => typeof ar.action === 'string' ? ar.action : ar.action.action || ''));
                    }
                    else {
                        keybinds.push(typeof keybind.action === 'string' ? keybind.action : keybind.action.action || '');
                    }
                    for (const keybindShort of keybinds) {
                        (0, keybinder_1.unregisterKeybind)(keybindShort, hud.dir);
                    }
                }
            }
            (0, keybinder_1.unregisterKeybind)('Left Alt+F');
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
    showWindow(hud, io) {
        if (!this.current)
            return;
        this.current.setOpacity(1);
        this.current.show();
        /*globalShortcut.register('Alt+F', () => {
            if (!this.current || !hud || !hud.url) return;
            this.current.loadURL(hud.url);
        });*/
        (0, keybinder_1.registerKeybind)('Left Alt+F', () => {
            if (!this.current || !hud || !hud.url)
                return;
            this.current.loadURL(hud.url);
        });
        if (hud.keybinds) {
            for (const bind of hud.keybinds) {
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
                        io.to(hud.dir).emit('keybindAction', action);
                    if (!exec)
                        return;
                    socket_1.mirvPgl.execute(exec);
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
        const io = await socket_1.ioPromise;
        if (this.tray !== null) {
            this.tray.destroy();
        }
        if (this.current === null)
            return null;
        this.current.close();
        this.current = null;
        io.emit('hud_opened', false);
        return true;
    }
}
const HUDWindow = new HUD();
exports.default = HUDWindow;
