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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.isDev = exports.AFXInterop = void 0;
/* eslint-disable no-console */
var server_1 = __importDefault(require("./server"));
var directories = __importStar(require("./init/directories"));
var child_process_1 = require("child_process");
var args_1 = __importDefault(require("./init/args"));
var electron_1 = require("electron");
var renderer_1 = require("./renderer");
exports.AFXInterop = {
    process: null
};
exports.isDev = process.env.DEV === 'true';
function createRenderer(server, forceDev) {
    if (forceDev === void 0) { forceDev = false; }
    return __awaiter(this, void 0, void 0, function () {
        var RMTPServer, closeManager, args, renderer;
        return __generator(this, function (_a) {
            RMTPServer = child_process_1.fork(require.resolve('./RMTPServer.js'));
            closeManager = function () {
                if (server) {
                    server.close();
                }
                if (exports.AFXInterop.process) {
                    exports.AFXInterop.process.kill();
                }
                if (RMTPServer) {
                    RMTPServer.kill();
                }
                electron_1.app.quit();
            };
            args = ['./', '--renderer'];
            if (forceDev)
                args.push('--dev');
            renderer = child_process_1.spawn(process.execPath, args, {
                stdio: forceDev ? ['pipe', 'pipe', 'pipe', 'ipc'] : ['ignore', 'ignore', 'ignore', 'ipc']
            });
            electron_1.app.on('window-all-closed', function () { });
            electron_1.app.on('second-instance', function () {
                if (renderer.send) {
                    renderer.send('refocus');
                }
            });
            if (forceDev)
                renderer.stdout.on('data', function (data) { return console.log(data.toString()); });
            renderer.on('exit', closeManager);
            renderer.on('close', closeManager);
            electron_1.app.on('quit', function () {
                renderer.kill();
            });
            return [2 /*return*/];
        });
    });
}
function startManager() {
    return __awaiter(this, void 0, void 0, function () {
        var server, argv;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    electron_1.app.setAppUserModelId('com.lexogrine.hudmanager');
                    if (process.argv.includes('--renderer')) {
                        renderer_1.createMainWindow(process.argv.includes('--dev'));
                        return [2 /*return*/];
                    }
                    directories.checkDirectories();
                    return [4 /*yield*/, server_1["default"]()];
                case 1:
                    server = _a.sent();
                    argv = args_1["default"](process.argv);
                    if (!argv.noGUI) {
                        createRenderer(server, argv.dev);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var lock = electron_1.app.requestSingleInstanceLock();
if (!lock && !process.argv.includes('--renderer')) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('ready', startManager);
}
