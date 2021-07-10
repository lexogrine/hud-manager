"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
        const hud = await huds_1.getHUDData(dirName);
        if (hud === null)
            return null;
        const hudWindow = new electron_1.BrowserWindow({
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
        const tray = new electron_1.Tray(path.join(__dirname, 'favicon.ico'));
        tray.setToolTip('Lexogrine HUD Manager');
        tray.on('right-click', () => {
            const contextMenu = electron_1.Menu.buildFromTemplate([
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
                    keybinder_1.unregisterKeybind(keybind.bind, hud.dir);
                }
            }
            keybinder_1.unregisterKeybind("Alt+F");
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
        keybinder_1.registerKeybind("Alt+F", () => {
            if (!this.current || !hud || !hud.url)
                return;
            this.current.loadURL(hud.url);
        });
        if (hud.keybinds) {
            for (const bind of hud.keybinds) {
                keybinder_1.registerKeybind(bind.bind, () => {
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
