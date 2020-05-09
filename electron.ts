import { app, BrowserWindow, shell } from "electron";
import path from 'path';
import { Server } from 'http';
import args from './init/args';
import * as directories from './init/directories';
import init from './server'
import { loadConfig } from './server/api/config';
import { ChildProcess } from "child_process";

interface HLAEChild {
    process: ChildProcess | null
}

export const AFXInterop: HLAEChild = {
    process: null
}

export const isDev = process.env.DEV === "true";

async function createMainWindow(server: Server) {
    let win: BrowserWindow | null;
    if (app) {
        app.on("window-all-closed", app.quit);
    
        app.on("before-quit", () => {
            if (!win) return;
            win.removeAllListeners("close");
            win.close();
        });
    
    }

    win = new BrowserWindow({
        height: 700,
        show: false,
        frame:false,
        titleBarStyle:"hidden",
        //resizable: isDev,
        title: "HUD Manager",
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false,
        },
        width: 1010,
    });

    win.once("ready-to-show", () => {
        if (win) {
            win.show();
        }
    });

    // win.setMenu(null);
    const config = await loadConfig();

    win.setMenuBarVisibility(false);
    const startUrl =`http://localhost:${config.port}/`;

    win.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
    });

    win.loadURL(`${isDev ? `http://localhost:3000/?port=${config.port}` : startUrl}`);
    win.on("close", () => {
        server.close();
        win = null;
        if(AFXInterop.process){
            AFXInterop.process.kill();
        }
        app.quit();

    });
}

async function startManager() {
    app.setAppUserModelId("com.lexogrine.hudmanager");
    directories.checkDirectories();
    const server = await init();
    const argv = args(process.argv);
    if(!argv.noGui){
        createMainWindow(server);
    }
}
app.on("ready", startManager);

