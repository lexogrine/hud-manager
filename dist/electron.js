"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDev = exports.AFXInterop = void 0;
/* eslint-disable no-console */
const server_1 = __importDefault(require("./server"));
const directories = __importStar(require("./init/directories"));
const child_process_1 = require("child_process");
const args_1 = __importDefault(require("./init/args"));
const electron_1 = require("electron");
const renderer_1 = require("./renderer");
exports.AFXInterop = {
    process: null
};
exports.isDev = process.env.DEV === 'true';
const wait = (ms) => new Promise(r => setTimeout(r, ms));
async function mainProcess(server, forceDev = false, gui = true) {
    const RMTPServer = (0, child_process_1.fork)(require.resolve('./RMTPServer.js'));
    const closeManager = () => {
        if (server) {
            server.emit('send-data-before-closing');
            setTimeout(finallyCloseManager, 10000);
        }
        if (exports.AFXInterop.process) {
            exports.AFXInterop.process.kill();
        }
        if (RMTPServer) {
            RMTPServer.kill();
        }
        // app.quit();
    };
    const finallyCloseManager = () => {
        console.log('Closing LHM...');
        if (server) {
            server.close();
        }
        electron_1.app.quit();
    };
    server.on('sent-data-now-close', () => {
        console.log('Sent data, proceeding to close LHM...');
        finallyCloseManager();
    });
    electron_1.app.on('window-all-closed', () => { });
    if (!gui)
        return;
    const args = ['./', '--renderer'];
    if (forceDev)
        args.push('--dev');
    const renderer = (0, child_process_1.spawn)(process.execPath, args, {
        stdio: forceDev ? ['pipe', 'pipe', 'pipe', 'ipc'] : ['ignore', 'ignore', 'ignore', 'ipc']
    });
    electron_1.app.on('second-instance', () => {
        if (renderer.send) {
            renderer.send('refocus');
        }
    });
    if (forceDev)
        renderer.stdout?.on('data', data => console.log(data.toString()));
    renderer.on('exit', closeManager);
    renderer.on('close', closeManager);
    electron_1.app.on('quit', () => {
        renderer.kill();
    });
}
async function startManager() {
    electron_1.app.setAppUserModelId('com.lexogrine.hudmanager');
    if (process.argv.includes('--renderer')) {
        //console.log('d', new Date().getTime());
        (0, renderer_1.createMainWindow)(process.argv.includes('--dev'));
        return;
    }
    directories.checkDirectories();
    //await wait(3000);
    await directories.loadAllPremiumHUDs();
    //console.log('b', new Date().getTime());
    const server = await (0, server_1.default)();
    //console.log('c', new Date().getTime());
    const argv = (0, args_1.default)(process.argv);
    mainProcess(server, argv.dev || exports.isDev, !argv.noGUI);
}
const lock = electron_1.app.requestSingleInstanceLock();
if (!lock && !process.argv.includes('--renderer')) {
    electron_1.app.quit();
}
else {
    //console.log('a', new Date().getTime());
    electron_1.app.on('ready', startManager);
}
