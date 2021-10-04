"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacKeyServer = void 0;
const child_process_1 = require("child_process");
const MacGlobalKeyLookup_1 = require("./_data/MacGlobalKeyLookup");
const path_1 = __importDefault(require("path"));
const sudo_prompt_1 = __importDefault(require("sudo-prompt"));
const isSpawnEventSupported_1 = require("./isSpawnEventSupported");
const sPath = "../../bin/MacKeyServer";
/** Use this class to listen to key events on Mac OS */
class MacKeyServer {
    listener;
    proc;
    config;
    running = false;
    restarting = false;
    /**
     * Creates a new key server for mac
     * @param listener The callback to report key events to
     * @param config Additional optional configuration for the server
     */
    constructor(listener, config = {}) {
        this.listener = listener;
        this.config = config;
        this.proc = null;
    }
    /**
     * Start the Key server and listen for keypresses
     * @param skipPerms Whether to skip attempting to add permissions
     */
    start(skipPerms) {
        this.running = true;
        const path = path_1.default.join(__dirname, sPath);
        this.proc = child_process_1.spawn(path);
        if (this.config.onInfo)
            this.proc.stderr.on("data", data => this.config.onInfo?.(data.toString()));
        const onError = this.config.onError;
        if (onError)
            this.proc.on("close", code => {
                if (!this.restarting && this.running)
                    onError(code);
            });
        this.proc.stdout.on("data", data => {
            const events = this._getEventData(data);
            for (const { event, eventId } of events) {
                const stopPropagation = !!this.listener(event);
                this.proc.stdin.write(`${stopPropagation ? "1" : "0"},${eventId}\n`);
            }
        });
        return this.handleStartup(skipPerms ?? false);
    }
    /**
     * Deals with the startup process of the server, possibly adding perms if required and restarting
     * @param skipPerms Whether to skip attempting to add permissions
     */
    handleStartup(skipPerms) {
        return new Promise((res, rej) => {
            let errored = false;
            // If setup fails, try adding permissions
            this.proc.on("error", async (err) => {
                errored = true;
                if (skipPerms) {
                    rej(err);
                }
                else {
                    try {
                        this.restarting = true;
                        this.proc.kill();
                        await this.addPerms(path_1.default.join(__dirname, sPath));
                        // If the server was stopped in between, just act as if it was started successfully
                        if (!this.running) {
                            res();
                            return;
                        }
                        res(this.start(true));
                    }
                    catch (e) {
                        rej(e);
                    }
                    finally {
                        this.restarting = false;
                    }
                }
            });
            if (isSpawnEventSupported_1.isSpawnEventSupported())
                this.proc.on("spawn", res);
            // A timed fallback if the spawn event is not supported
            else
                setTimeout(() => {
                    if (!errored)
                        res();
                }, 200);
        });
    }
    /**
     * Makes sure that the given path is executable
     * @param path The path to add the perms to
     */
    addPerms(path) {
        const options = {
            name: "Global key listener",
        };
        return new Promise((res, err) => {
            sudo_prompt_1.default.exec(`chmod +x "${path}"`, options, (error, stdout, stderr) => {
                if (error) {
                    err(error);
                    return;
                }
                if (stderr) {
                    err(stderr);
                    return;
                }
                res();
            });
        });
    }
    /** Stop the Key server */
    stop() {
        this.running = false;
        this.proc.stdout.pause();
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
            const lineData = line.replace(/\s+/, "");
            const arr = lineData.split(",");
            const vKey = parseInt(arr[0]);
            const key = MacGlobalKeyLookup_1.MacGlobalKeyLookup[vKey];
            const keyDown = /DOWN/.test(arr[1]);
            const eventId = arr[2];
            return {
                event: {
                    vKey,
                    rawKey: key,
                    name: key?.standardName,
                    state: keyDown ? "DOWN" : "UP",
                    scanCode: vKey,
                    _raw: sData,
                },
                eventId,
            };
        });
    }
}
exports.MacKeyServer = MacKeyServer;
