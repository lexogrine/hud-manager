import { BrowserWindow, Tray, Menu, MenuItem } from "electron";
import { getHUDData } from './../server/api/huds';
import * as path from 'path';

class HUD {
    current: BrowserWindow | null;
    tray: Tray | null;
    constructor(){
        this.current = null;
        this.tray = null;
    }

    open(dirName: string){
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

        hudWindow.once('ready-to-show', hudWindow.show);
        hudWindow.loadURL(`http://localhost:1337/huds/${hud.dir}/`);

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