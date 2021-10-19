"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinKeyServer = void 0;
const child_process_1 = require("child_process");
const WinGlobalKeyLookup_1 = require("./_data/WinGlobalKeyLookup");
const path_1 = __importDefault(require("path"));
const isSpawnEventSupported_1 = require("./isSpawnEventSupported");
const sPath = path_1.default.join(__dirname, './../../bin/WinKeyServer.exe');
/** Use this class to listen to key events on Windows OS */
class WinKeyServer {
    listener;
    proc;
    config;
    /**
     * Creates a new key server for windows
     * @param listener The callback to report key events to
     * @param windowsConfig The optional windows configuration
     */
    constructor(listener, config = {}) {
        this.listener = listener;
        this.config = config;
        this.proc = null;
    }
    /** Start the Key server and listen for keypresses */
    async start() {
        this.proc = (0, child_process_1.execFile)(sPath, { maxBuffer: Infinity });
        if (this.config.onInfo)
            this.proc?.stderr?.on('data', data => this.config.onInfo?.(data.toString()));
        if (this.config.onError)
            this.proc.on('close', this.config.onError);
        this.proc?.stdout?.on('data', data => {
            const events = this._getEventData(data);
            for (const { event, eventId } of events) {
                const stopPropagation = !!this.listener(event);
                this.proc?.stdin?.write(`${stopPropagation ? '1' : '0'},${eventId}\n`);
            }
        });
        return new Promise((res, err) => {
            this.proc.on('error', err);
            if ((0, isSpawnEventSupported_1.isSpawnEventSupported)())
                this.proc.on('spawn', res);
            // A timed fallback if the spawn event is not supported
            else
                setTimeout(res, 200);
        });
    }
    /** Stop the Key server */
    stop() {
        this.proc?.stdout?.pause();
        this.proc.kill();
    }
    /**
     * Obtains a IGlobalKeyEvent from stdout buffer data
     * @param data Data from stdout
     * @returns The standardized key event data
     */
    _getEventData(data) {
        const sData = data.toString();
        const lines = sData.trim().split(/\n/);
        return lines.map(line => {
            const lineData = line.replace(/\s+/, '');
            const arr = lineData.split(',');
            const vKey = parseInt(arr[0]);
            const key = WinGlobalKeyLookup_1.WinGlobalKeyLookup[vKey];
            const keyDown = /DOWN/.test(arr[1]);
            const scanCode = parseInt(arr[2]);
            const eventId = arr[3];
            return {
                event: {
                    vKey,
                    rawKey: key,
                    name: key?.standardName,
                    state: keyDown ? 'DOWN' : 'UP',
                    scanCode,
                    _raw: sData
                },
                eventId
            };
        });
    }
}
exports.WinKeyServer = WinKeyServer;
