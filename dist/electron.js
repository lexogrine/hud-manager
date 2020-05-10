"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var args_1 = __importDefault(require("./init/args"));
var directories = __importStar(require("./init/directories"));
var server_1 = __importDefault(require("./server"));
var config_1 = require("./server/api/config");
exports.AFXInterop = {
    process: null
};
exports.isDev = process.env.DEV === "true";
function createMainWindow(server) {
    return __awaiter(this, void 0, void 0, function () {
        var win, config, startUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (electron_1.app) {
                        electron_1.app.on("window-all-closed", electron_1.app.quit);
                        electron_1.app.on("before-quit", function () {
                            if (!win)
                                return;
                            win.removeAllListeners("close");
                            win.close();
                        });
                    }
                    win = new electron_1.BrowserWindow({
                        height: 700,
                        show: false,
                        frame: false,
                        titleBarStyle: "hidden",
                        //resizable: isDev,
                        title: "HUD Manager",
                        icon: path_1["default"].join(__dirname, 'assets/icon.png'),
                        webPreferences: {
                            nodeIntegration: true,
                            backgroundThrottling: false
                        },
                        width: 1010
                    });
                    win.once("ready-to-show", function () {
                        if (win) {
                            win.show();
                        }
                    });
                    return [4 /*yield*/, config_1.loadConfig()];
                case 1:
                    config = _a.sent();
                    win.setMenuBarVisibility(false);
                    startUrl = "http://localhost:" + config.port + "/";
                    win.webContents.on('new-window', function (e, url) {
                        e.preventDefault();
                        electron_1.shell.openExternal(url);
                    });
                    win.loadURL("" + (exports.isDev ? "http://localhost:3000/?port=" + config.port : startUrl));
                    win.on("close", function () {
                        server.close();
                        win = null;
                        if (exports.AFXInterop.process) {
                            exports.AFXInterop.process.kill();
                        }
                        electron_1.app.quit();
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function startManager() {
    return __awaiter(this, void 0, void 0, function () {
        var server, argv;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    electron_1.app.setAppUserModelId("com.lexogrine.hudmanager");
                    directories.checkDirectories();
                    return [4 /*yield*/, server_1["default"]()];
                case 1:
                    server = _a.sent();
                    argv = args_1["default"](process.argv);
                    if (!argv.noGui) {
                        createMainWindow(server);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
electron_1.app.on("ready", startManager);
