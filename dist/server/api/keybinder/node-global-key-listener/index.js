"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalKeyboardListener = void 0;
const os_1 = __importDefault(require("os"));
const WinKeyServer_1 = require("./ts/WinKeyServer");
__exportStar(require("./ts/_types/IGlobalKeyListener"), exports);
__exportStar(require("./ts/_types/IGlobalKeyEvent"), exports);
__exportStar(require("./ts/_types/IGlobalKey"), exports);
__exportStar(require("./ts/_types/IGlobalKeyDownMap"), exports);
__exportStar(require("./ts/_types/IWindowsConfig"), exports);
__exportStar(require("./ts/_types/IConfig"), exports);
/**
 * A cross-platform global keyboard listener. Ideal for setting up global keyboard shortcuts
 * and key-loggers (usually for automation).
 * This keyserver uses low-level hooks on Windows OS and Event Taps on Mac OS, which allows
 * event propagation to be halted to the rest of the operating system as well as allowing
 * any key to be used for shortcuts.
 */
class GlobalKeyboardListener {
    /** The underlying keyServer used to listen and halt propagation of events */
    keyServer;
    listeners;
    config;
    /** Whether the server is currently running */
    isRunning = false;
    stopTimeoutID = 0;
    /** The underlying map of keys that are being held down */
    isDown;
    /**
     * Creates a new keyboard listener
     * @param config The optional configuration for the key listener
     */
    constructor(config = {}) {
        this.listeners = [];
        this.isDown = {};
        this.config = config;
        switch (os_1.default.platform()) {
            case 'win32':
                this.keyServer = new WinKeyServer_1.WinKeyServer(this.baseListener, config.windows);
                break;
            default:
                throw Error('This OS is not supported');
        }
    }
    /**
     * Add a global keyboard listener to the global keyboard listener server.
     * @param listener The listener to add to the global keyboard listener
     * @throws An exception if the process could not be started
     */
    async addListener(listener) {
        this.listeners.push(listener);
        if (this.listeners.length == 1) {
            clearTimeout(this.stopTimeoutID);
            await this.start();
        }
    }
    /**
     * Remove a global keyboard listener from the global keyboard listener server.
     * @param listener The listener to remove from the global keyboard listener
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index != -1) {
            this.listeners.splice(index, 1);
            if (this.listeners.length == 0) {
                if (this.config.disposeDelay == -1)
                    this.stop();
                else
                    this.stopTimeoutID = setTimeout(() => this.stop(), this.config.disposeDelay ?? 100);
            }
        }
    }
    /** Removes all listeners and destroys the key server */
    kill() {
        this.listeners = [];
        this.stop();
    }
    /** Start the key server */
    start() {
        let promise = Promise.resolve();
        if (!this.isRunning)
            promise = this.keyServer.start();
        this.isRunning = true;
        return promise;
    }
    /** Stop the key server */
    stop() {
        if (this.isRunning)
            this.keyServer.stop();
        this.isRunning = false;
    }
    /** The following listener is used to monitor which keys are being held down */
    baseListener = event => {
        if (event.name) {
            switch (event.state) {
                case 'DOWN':
                    this.isDown[event.name] = true;
                    break;
                case 'UP':
                    this.isDown[event.name] = false;
                    break;
            }
        }
        let stopPropagation = false;
        for (const onKey of this.listeners) {
            //Forward event
            try {
                const res = onKey(event, this.isDown);
                //Handle catch data
                if (res instanceof Object) {
                    if (res.stopPropagation)
                        stopPropagation = true;
                    if (res.stopImmediatePropagation)
                        break;
                }
                else if (res) {
                    stopPropagation = true;
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        return stopPropagation;
    };
}
exports.GlobalKeyboardListener = GlobalKeyboardListener;
