import { app, BrowserWindow } from "electron";
import path from 'path';
import * as directories from './init/directories';
import init from './server'
let win: BrowserWindow | null;

async function createMainWindow() {
    const server = await init();
    directories.checkDirectories();

    win = new BrowserWindow({
        height: 720,
        minHeight: 600,
        minWidth: 400,
        show: false,
        title: "HUD Manager",
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            backgroundThrottling: false,
        },
        width: 1280,
    });

    win.once("ready-to-show", () => {
        if (win) {
            win.show();
        }
    });

    // win.setMenu(null);
    win.setMenuBarVisibility(false);
    win.loadURL("http://localhost:3000/");
    win.on("close", () => {
        server.close();
        //const windows = win.getChildWindows();
        //windows.map(window => window.close());
        win = null;
        app.quit();

    });
}
if (app) {

    app.on("window-all-closed", app.quit);

    app.on("before-quit", () => {
        if (!win) return;
        win.removeAllListeners("close");
        win.close();
    });

    app.on("ready", createMainWindow);
}
