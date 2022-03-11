"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMainWindow = exports.processEvents = void 0;
const electron_1 = require("electron");
const events_1 = __importDefault(require("events"));
const path_1 = __importDefault(require("path"));
const autoUpdater_1 = __importDefault(require("./autoUpdater"));
const config_1 = require("./server/api/config");
const isDev = process.env.DEV === 'true';
exports.processEvents = new events_1.default();
const createMainWindow = async (forceDev = false) => {
    let win;
    exports.processEvents.on('refocus', () => {
        if (win) {
            if (win.isMinimized())
                win.restore();
            win.focus();
        }
    });
    if (electron_1.app) {
        electron_1.app.on('window-all-closed', electron_1.app.quit);
        electron_1.app.on('before-quit', async () => {
            if (!win)
                return;
            win.removeAllListeners('close');
            win.close();
        });
    }
    win = new electron_1.BrowserWindow({
        height: 874,
        show: false,
        frame: false,
        titleBarStyle: 'hidden',
        //resizable: isDev,
        title: 'Lexogrine HUD Manager',
        icon: path_1.default.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false,
            devTools: isDev || forceDev,
            preload: path_1.default.join(__dirname, 'preload.js')
        },
        minWidth: 740,
        minHeight: 440,
        width: 1200
    });
    electron_1.ipcMain.on('min', () => {
        win?.minimize();
    });
    electron_1.ipcMain.on('max', () => {
        if (win?.isMaximized()) {
            win?.restore();
        }
        else {
            win?.maximize();
        }
    });
    (0, autoUpdater_1.default)(win);
    electron_1.ipcMain.on('close', () => {
        win?.close();
    });
    win.once('ready-to-show', () => {
        if (win) {
            win.show();
            win.webContents.openDevTools();
        }
    });
    // win.setMenu(null);
    const config = await (0, config_1.loadConfig)();
    win.setMenuBarVisibility(false);
    const startUrl = `http://localhost:${config.port}/`;
    win.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        electron_1.shell.openExternal(url);
    });
    console.log('g', new Date().getTime());
    win.loadURL(`${isDev ? `http://localhost:3000/?port=${config.port}` : startUrl}`);
    win.on('close', () => {
        win = null;
        electron_1.app.quit();
    });
};
exports.createMainWindow = createMainWindow;
