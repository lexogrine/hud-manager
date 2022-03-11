"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
function mainProcess(server) {
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
    electron_1.app.on('quit', closeManager);
    const finallyCloseManager = () => {
        if (server) {
            server.close();
        }
        electron_1.app.quit();
    };
    server.on('sent-data-now-close', () => {
        finallyCloseManager();
    });
    electron_1.app.on('second-instance', () => {
        renderer_1.processEvents.emit('refocus');
    });
}
async function startManagerQuickly() {
    electron_1.app.setAppUserModelId('com.lexogrine.hudmanager');
    directories.checkDirectories();
    const [server] = await Promise.all([(0, server_1.default)(), directories.loadAllPremiumHUDs()]);
    //await directories.loadAllPremiumHUDs();
    //const server = await init();
    const argv = (0, args_1.default)(process.argv);
    mainProcess(server);
    if (!argv.noGUI)
        (0, renderer_1.createMainWindow)(argv.dev || exports.isDev);
}
const lock = electron_1.app.requestSingleInstanceLock();
if (!lock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('ready', startManagerQuickly);
}
