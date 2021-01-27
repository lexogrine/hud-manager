"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.verifyUrl = exports.setConfig = exports.updateConfig = exports.getConfig = exports.loadConfig = exports.internalIP = exports.publicIP = void 0;
var database_1 = __importDefault(require("./../../init/database"));
var fs_1 = __importDefault(require("fs"));
var ip_1 = __importDefault(require("ip"));
var public_ip_1 = __importDefault(require("public-ip"));
var internal_ip_1 = __importDefault(require("internal-ip"));
var configs = database_1["default"].config;
exports.publicIP = null;
exports.internalIP = internal_ip_1["default"].v4.sync() || ip_1["default"].address();
public_ip_1["default"]
    .v4()
    .then(function (ip) {
    exports.publicIP = ip;
})["catch"]();
exports.loadConfig = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (res) {
                configs.find({}, function (err, config) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (err) {
                                    return [2 /*return*/, res(null)];
                                }
                                if (!config.length) return [3 /*break*/, 2];
                                if ((!config[0].hlaePath || fs_1["default"].existsSync(config[0].hlaePath)) &&
                                    (!config[0].afxCEFHudInteropPath || fs_1["default"].existsSync(config[0].afxCEFHudInteropPath))) {
                                    return [2 /*return*/, res(config[0])];
                                }
                                if (config[0].hlaePath && !fs_1["default"].existsSync(config[0].hlaePath)) {
                                    config[0].hlaePath = '';
                                }
                                if (config[0].afxCEFHudInteropPath && !fs_1["default"].existsSync(config[0].afxCEFHudInteropPath)) {
                                    config[0].afxCEFHudInteropPath = '';
                                }
                                _a = res;
                                return [4 /*yield*/, exports.setConfig(config[0])];
                            case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                            case 2:
                                configs.insert({ steamApiKey: '', token: '', port: 1349, hlaePath: '', afxCEFHudInteropPath: '' }, function (err, config) {
                                    if (err) {
                                        return res(null);
                                    }
                                    return res(config);
                                });
                                return [2 /*return*/];
                        }
                    });
                }); });
            })];
    });
}); };
exports.getConfig = function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.loadConfig()];
            case 1:
                config = _a.sent();
                if (!config) {
                    return [2 /*return*/, res.sendStatus(500)];
                }
                response = __assign(__assign({}, config), { ip: exports.internalIP });
                return [2 /*return*/, res.json(response)];
        }
    });
}); };
exports.updateConfig = function (io) { return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var updated, config;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                updated = {
                    steamApiKey: req.body.steamApiKey,
                    port: Number(req.body.port),
                    token: req.body.token,
                    hlaePath: req.body.hlaePath,
                    afxCEFHudInteropPath: req.body.afxCEFHudInteropPath
                };
                return [4 /*yield*/, exports.setConfig(updated)];
            case 1:
                config = _a.sent();
                if (!config) {
                    return [2 /*return*/, res.sendStatus(500)];
                }
                io.emit('config');
                return [2 /*return*/, res.json(config)];
        }
    });
}); }; };
exports.setConfig = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (res) {
                configs.update({}, { $set: config }, {}, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var newConfig;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    return [2 /*return*/, res(null)];
                                }
                                return [4 /*yield*/, exports.loadConfig()];
                            case 1:
                                newConfig = _a.sent();
                                if (!newConfig) {
                                    return [2 /*return*/, res(null)];
                                }
                                return [2 /*return*/, res(newConfig)];
                        }
                    });
                }); });
            })];
    });
}); };
exports.verifyUrl = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var cfg, bases, base, path, pathRegex;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!url || typeof url !== 'string')
                    return [2 /*return*/, false];
                if (url.startsWith('http://localhost:3500/'))
                    return [2 /*return*/, true];
                return [4 /*yield*/, exports.loadConfig()];
            case 1:
                cfg = _a.sent();
                bases = ["http://" + exports.internalIP + ":" + cfg.port, "http://" + exports.publicIP + ":" + cfg.port];
                if (process.env.DEV === 'true') {
                    bases.push("http://localhost:3000/?port=" + cfg.port);
                }
                base = bases.find(function (base) { return url.startsWith(base); });
                if (!base)
                    return [2 /*return*/, false];
                path = url.substr(base.length);
                if (!path || path === '/')
                    return [2 /*return*/, true];
                if (!path.endsWith("/?port=" + cfg.port + "&isProd=true"))
                    return [2 /*return*/, false];
                path = path.substr(0, path.lastIndexOf('/'));
                pathRegex = /^\/huds\/([a-zA-Z0-9_-]+)$/;
                return [2 /*return*/, pathRegex.test(path)];
        }
    });
}); };
