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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var electron_1 = require("electron");
var express_1 = __importDefault(require("express"));
var config_1 = require("./config");
var ip_1 = __importDefault(require("ip"));
var huds_1 = __importDefault(require("./../../init/huds"));
exports.listHUDs = function () { return __awaiter(void 0, void 0, void 0, function () {
    var dir, filtered, huds;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dir = path.join(electron_1.app.getPath('home'), 'HUDs');
                filtered = fs.readdirSync(dir, { withFileTypes: true })
                    .filter(function (dirent) { return dirent.isDirectory(); });
                return [4 /*yield*/, Promise.all(filtered.map(function (dirent) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, exports.getHUDData(dirent.name)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); }))];
            case 1:
                huds = _a.sent();
                return [2 /*return*/, huds.filter(function (hud) { return hud !== null; })];
        }
    });
}); };
exports.getHUDs = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = res).json;
                return [4 /*yield*/, exports.listHUDs()];
            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
        }
    });
}); };
exports.getHUDData = function (dirName) { return __awaiter(void 0, void 0, void 0, function () {
    var dir, configFileDir, globalConfig, configFile, config, panel, keybinds;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dir = path.join(electron_1.app.getPath('home'), 'HUDs', dirName);
                configFileDir = path.join(dir, 'hud.json');
                return [4 /*yield*/, config_1.loadConfig()];
            case 1:
                globalConfig = _a.sent();
                if (!fs.existsSync(configFileDir)) {
                    return [2 /*return*/, null];
                }
                try {
                    configFile = fs.readFileSync(configFileDir, { encoding: 'utf8' });
                    config = JSON.parse(configFile);
                    config.dir = dirName;
                    panel = exports.getHUDPanelSetting(dirName);
                    keybinds = exports.getHUDKeyBinds(dirName);
                    if (panel) {
                        config.panel = panel;
                    }
                    if (keybinds) {
                        config.keybinds = keybinds;
                    }
                    config.url = "http://" + ip_1["default"].address() + ":" + globalConfig.port + "/huds/" + dirName + "/?port=" + globalConfig.port + "&isProd=true";
                    return [2 /*return*/, config];
                }
                catch (e) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.getHUDKeyBinds = function (dirName) {
    var dir = path.join(electron_1.app.getPath('home'), 'HUDs', dirName);
    var keybindsFileDir = path.join(dir, 'keybinds.json');
    if (!fs.existsSync(keybindsFileDir)) {
        return null;
    }
    try {
        var keybindsFile = fs.readFileSync(keybindsFileDir, { encoding: 'utf8' });
        var keybinds = JSON.parse(keybindsFile);
        return keybinds;
    }
    catch (e) {
        return null;
    }
};
exports.getHUDPanelSetting = function (dirName) {
    var dir = path.join(electron_1.app.getPath('home'), 'HUDs', dirName);
    var panelFileDir = path.join(dir, 'panel.json');
    if (!fs.existsSync(panelFileDir)) {
        return null;
    }
    try {
        var panelFile = fs.readFileSync(panelFileDir, { encoding: 'utf8' });
        var panel = JSON.parse(panelFile);
        panel.dir = dirName;
        return panel;
    }
    catch (e) {
        return null;
    }
};
exports.openHUDsDirectory = function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var dir;
    return __generator(this, function (_a) {
        dir = path.join(electron_1.app.getPath('home'), 'HUDs', 'AA');
        electron_1.shell.showItemInFolder(dir);
        return [2 /*return*/, res.sendStatus(200)];
    });
}); };
exports.renderHUD = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.dir) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                return [4 /*yield*/, exports.getHUDData(req.params.dir)];
            case 1:
                data = _a.sent();
                if (!data) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                if (data.legacy) {
                    return [2 /*return*/, exports.renderLegacy(req, res, null)];
                }
                return [2 /*return*/, exports.render(req, res, null)];
        }
    });
}); };
exports.render = function (req, res) {
    var dir = path.join(electron_1.app.getPath('home'), 'HUDs', req.params.dir);
    return res.sendFile(path.join(dir, 'index.html'));
};
exports.renderThumbnail = function (req, res) {
    var thumbPath = path.join(electron_1.app.getPath('home'), 'HUDs', req.params.dir, "thumb.png");
    if (fs.existsSync(thumbPath)) {
        return res.sendFile(thumbPath);
    }
    return res.sendFile(path.join(__dirname, '../../assets/icon.png'));
};
exports.renderAssets = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.dir) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                return [4 /*yield*/, exports.getHUDData(req.params.dir)];
            case 1:
                data = _a.sent();
                if (!data) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                return [2 /*return*/, express_1["default"].static(path.join(electron_1.app.getPath('home'), 'HUDs', req.params.dir))(req, res, next)];
        }
    });
}); };
exports.renderLegacy = function (req, res) {
    var dir = path.join(electron_1.app.getPath('home'), 'HUDs', req.params.dir);
    return res.render(path.join(dir, 'template.pug'), {
        ip: 'localhost',
        port: 1337,
        avatars: false,
        hud: path.join('/legacy', req.params.dir, 'index.js'),
        css: path.join('/legacy', req.params.dir, 'style.css'),
        delay: 0
    });
};
exports.legacyJS = function (req, res) {
    var dir = path.join(electron_1.app.getPath('home'), 'HUDs', req.params.hudName, 'index.js');
    if (!fs.existsSync(dir)) {
        return res.sendStatus(404);
    }
    try {
        var file = fs.readFileSync(dir, { encoding: 'utf8' });
        res.setHeader('Content-Type', 'application/javascript');
        return res.end(file);
    }
    catch (e) {
        return res.sendStatus(404);
    }
};
exports.legacyCSS = function (req, res) {
    var dir = path.join(electron_1.app.getPath('home'), 'HUDs', req.params.hudName, 'style.css');
    if (!fs.existsSync(dir)) {
        return res.sendStatus(404);
    }
    try {
        var file = fs.readFileSync(dir, { encoding: 'utf8' });
        res.setHeader('Content-Type', 'text/css');
        return res.end(file);
    }
    catch (e) {
        return res.sendStatus(404);
    }
};
exports.showHUD = function (io) { return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, huds_1["default"].open(req.params.hudDir, io)];
            case 1:
                response = _a.sent();
                if (response) {
                    return [2 /*return*/, res.sendStatus(200)];
                }
                return [2 /*return*/, res.sendStatus(404)];
        }
    });
}); }; };
exports.closeHUD = function (req, res) {
    var response = huds_1["default"].close();
    if (response) {
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
};
