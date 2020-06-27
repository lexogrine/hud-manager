import { BrowserWindow, Tray, Menu, globalShortcut } from "electron";
import { getHUDData } from './../server/api/huds';
import * as path from 'path';
//import ip from 'ip';
import socketio from 'socket.io';
import * as I from './../types/interfaces';

class HUD {
    current: BrowserWindow | null;
    tray: Tray | null;
    show: boolean;
    constructor(){
        this.current = null;
        this.tray = null;
        this.show = true;
    }

    async open(dirName: string, io: socketio.Server){
        if(this.current !== null) return null;
        const hud = await getHUDData(dirName);
        if(hud === null) return null;
        const hudWindow = new BrowserWindow({
            fullscreen:true,
            show: false,
            title: hud.name,
            resizable: false,
            alwaysOnTop: true,
            frame: false,
            transparent: true,
            focusable: true,
            webPreferences: {
                backgroundThrottling: false,
            }
        });
        hudWindow.on("show", () => {
            hudWindow.setAlwaysOnTop(true);
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

        this.showWindow(hud, io);
        hudWindow.loadURL(hud.url);

        hudWindow.on('close', () => {
            globalShortcut.unregisterAll();
            this.current = null;
            if(this.tray !== null){
                this.tray.destroy();
            }
        });

        return true;
    }

    showWindow(hud: I.HUD, io: socketio.Server){
        if(!this.current) return;
        this.current.setOpacity(1);
        this.current.show();
        if(hud.keybinds){
            for(let bind of hud.keybinds){
                globalShortcut.register(bind.bind, () => {
                    io.to(hud.dir).emit("keybindAction", bind.action);
                });
            }
        }

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