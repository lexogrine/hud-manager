import { BrowserWindow, Tray, Menu, MenuItem } from "electron";
import { getHUDData } from './../server/api/huds';
import * as path from 'path';
import ip from 'ip';
import { loadConfig } from './../server/api/config';

class HUD {
    current: BrowserWindow | null;
    tray: Tray | null;
    show: boolean;
    constructor(){
        this.current = null;
        this.tray = null;
        this.show = true;
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
            transparent: true,
            webPreferences: {
                backgroundThrottling: false,
            }
        });
        hudWindow.setIgnoreMouseEvents(true);

        const tray = new Tray(path.join(__dirname, 'favicon.ico'));

        tray.setToolTip('HUD Manager');
        tray.on('right-click', () => {
            const contextMenu = Menu.buildFromTemplate([
                { label: hud.name, enabled: false },
                { type: "separator" },
                { label: 'Show', type: "checkbox", click: () => this.toggleVisibility(), checked:this.show },
                { label: 'Close HUD', click: () => this.close() }
            ]);
            tray.popUpContextMenu(contextMenu);
        });

        this.tray = tray;

        this.current = hudWindow;
        const config = await loadConfig();
        hudWindow.once('ready-to-show', hudWindow.show);
        hudWindow.loadURL(`http://${ip.address()}:${config.port}/huds/${hud.dir}/?port=${config.port}&isProd=true`);

        hudWindow.on('close', () => {
            this.current = null;
            if(this.tray !== null){
                this.tray.destroy();
            }
        });

        return true;
    }

    toggleVisibility(){
        this.show = !this.show;
        if(this.current){
            this.current.setOpacity(this.show ? 1 : 0);
        }
    }

    close(){
        if(this.tray !== null){
            this.tray.destroy();
        }
        if(this.current === null) return null;

        this.current.close();
        this.current = null;

        return true;
    }
}

const HUDWindow = new HUD();

export default HUDWindow;