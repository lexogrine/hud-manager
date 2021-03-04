"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const portscanner_1 = __importDefault(require("portscanner"));
const config_1 = require("../api/config");
const sockets_1 = require("../sockets");
const HUDStateManager_1 = require("./HUDStateManager");
class DevHUDListener {
    constructor(port) {
        this.checkPort = () => {
            portscanner_1.default.checkPortStatus(this.port, '127.0.0.1', (err, portStatus) => {
                const status = portStatus === 'open';
                if (status !== this.status) {
                    this.callback(status);
                }
                this.status = status;
            });
            /**/
        };
        this.port = port;
        this.status = false;
        this.callback = () => { };
        this.interval = -1;
    }
    onChange(callback) {
        this.callback = callback;
    }
    start() {
        if (this.interval !== -1)
            return;
        const id = setInterval(this.checkPort, 3000);
        this.interval = id;
    }
    stop() {
        clearInterval(this.interval);
    }
}
const getJSONArray = url => {
    return fetch(url)
        .then(res => res.json())
        .then(panel => {
        try {
            if (!panel)
                return [];
            if (!Array.isArray(panel))
                return [];
            return panel;
        }
        catch {
            return [];
        }
    })
        .catch(() => []);
};
const portListener = new DevHUDListener(3500);
portListener.onChange(async (status) => {
    const io = await sockets_1.ioPromise;
    if (!status) {
        sockets_1.HUDState.devHUD = null;
        return io.emit('reloadHUDs');
    }
    if (sockets_1.HUDState.devHUD)
        return;
    fetch('http://localhost:3500/dev/hud.json')
        .then(res => res.json())
        .then(async (hud) => {
        try {
            if (!hud)
                return;
            if (!hud || !hud.version || !hud.author)
                return;
            hud.keybinds = await getJSONArray('http://localhost:3500/dev/keybinds.json');
            hud.panel = await getJSONArray('http://localhost:3500/dev/panel.json');
            hud.isDev = true;
            hud.dir = (Math.random() * 1000 + 1)
                .toString(36)
                .replace(/[^a-z]+/g, '')
                .substr(0, 15);
            const cfg = await config_1.loadConfig();
            if (!cfg) {
                return;
            }
            hud.url = `http://${config_1.internalIP}:${cfg.port}/development/`;
            sockets_1.HUDState.devHUD = hud;
            if (sockets_1.runtimeConfig.devSocket) {
                const hudData = sockets_1.HUDState.get(hud.dir);
                const extended = await HUDStateManager_1.HUDStateManager.extend(hudData);
                io.to(hud.dir).emit('hud_config', extended);
            }
        }
        catch { }
        io.emit('reloadHUDs');
    })
        .catch(() => {
        return io.emit('reloadHUDs');
    });
});
portListener.start();
