import { BrowserWindow, Tray, Menu, MenuItem } from "electron";
import { getHUDData } from './../server/api/huds';
import * as path from 'path';
import ip from 'ip';
import { loadConfig } from './../server/api/config';

class HUD {
    current: BrowserWindow | null;
    tray: Tray | null;
    constructor(){
        this.current = null;
        this.tray = null;
    }

    async open(dirName: string){
        if(this.current !== null) return null;
        const hud = getHUDData(dirName);
        if(hud === null) return null;
        const hudWindow = new BrowserWindow({
            fullscreen:true,
            show: false,
            title: hud.name,
            resizable: false,
            alwaysOnTop: true,
            frame: false,
            focusable:false,
            transparent: true,
            webPreferences: {
                backgroundThrottling: false,
            }
        });
        hudWindow.setIgnoreMouseEvents(true);

        const tray = new Tray(path.join(__dirname, 'favicon.ico'));

        tray.setToolTip('HUD Manager');
        tray.on('right-click', () => {
            const rcMenu = new Menu();
            const closeHUD = new MenuItem({label: 'Close HUD', click: () => this.close()});
            rcMenu.append(closeHUD);
            tray.popUpContextMenu(rcMenu);
        })

        this.tray = tray;

        this.current = hudWindow;
        const config = await loadConfig();
        hudWindow.once('ready-to-show', hudWindow.show);
        hudWindow.loadURL(`http://${ip.address()}:${config.port}/huds/${hud.dir}/?port=${config.port}&isProd=true`);

        hudWindow.on('close', () => {
            this.current = null;
        });

        return true;
    }

    close(){
        if(this.current === null) return null;
        if(this.tray !== null){
            this.tray.destroy();
        }

        this.current.close();
        this.current = null;

        return true;
    }
}

const HUDWindow = new HUD();

export default HUDWindow;