import { app, BrowserWindow, shell, session } from "electron";
import path from 'path';
import fs from 'fs';
import args from './init/args';
import init from './server'
import { Server } from 'http';
import * as directories from './init/directories';
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

    const cookieFile = path.join(app.getPath('userData'), 'databases', 'cookie');

    const cookie = fs.readFileSync(cookieFile, 'utf8');
    try {
        const cookies = JSON.parse(cookie);
        if(Array.isArray(cookies)){
            for(const cookie of cookies){
                cookie.url = 'http://localhost:5000/';
                await session.defaultSession.cookies.set(cookie);
            }
        }
    } catch(e) { }
    if (app) {
        app.on("window-all-closed", app.quit);
    
        app.on("before-quit", async () => {
            const cookies = await session.defaultSession.cookies.get({url:'http://localhost:5000/'});

            fs.writeFileSync(cookieFile, JSON.stringify(cookies), 'utf8');

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
            devTools: isDev
        },
        minWidth: 775,
        minHeight:700,
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

