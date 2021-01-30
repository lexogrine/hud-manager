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
exports.__esModule = true;
exports.logout = exports.getCurrent = exports.loginHandler = void 0;
var electron_1 = require("electron");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var publickey_1 = require("./publickey");
var api_1 = require("./../api");
var tough_cookie_1 = require("tough-cookie");
var path_1 = __importDefault(require("path"));
var tough_cookie_file_store_1 = require("tough-cookie-file-store");
var fetch_cookie_1 = __importDefault(require("fetch-cookie"));
var machine_1 = require("./machine");
var cookiePath = path_1["default"].join(electron_1.app.getPath('userData'), 'cookie.json');
var cookieJar = new tough_cookie_1.CookieJar(new tough_cookie_file_store_1.FileCookieStore(cookiePath));
var fetch = fetch_cookie_1["default"](node_fetch_1["default"], cookieJar);
var api = function (url, method, body) {
    if (method === void 0) { method = 'GET'; }
    var options = {
        method: method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    var data = null;
    return fetch("https://hmapi.lexogrine.com/" + url, options).then(function (res) {
        data = res;
        return res.json()["catch"](function () { return data && data.status < 300; });
    });
};
var userHandlers = {
    get: function (machineId) { return api("auth/" + machineId); },
    login: function (username, password, ver) {
        return api('auth', 'POST', { username: username, password: password, ver: ver });
    },
    logout: function () { return api('auth', 'DELETE'); }
};
var verifyToken = function (token) {
    try {
        var result = jsonwebtoken_1["default"].verify(token, publickey_1.publicKey, { algorithms: ['RS256'] });
        if (result.user && result.license) {
            return result;
        }
        return false;
    }
    catch (_a) {
        return false;
    }
};
var loadUser = function (loggedIn) {
    if (loggedIn === void 0) { loggedIn = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var machineId, userToken, userData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    machineId = machine_1.getMachineId();
                    return [4 /*yield*/, userHandlers.get(machineId)];
                case 1:
                    userToken = _a.sent();
                    if (!userToken) {
                        return [2 /*return*/, { success: false, message: loggedIn ? 'Your session has expired - try restarting the application' : '' }];
                    }
                    if ('error' in userToken) {
                        return [2 /*return*/, { success: false, message: userToken.error }];
                    }
                    userData = verifyToken(userToken.token);
                    if (!userData) {
                        return [2 /*return*/, { success: false, message: 'Your session has expired - try restarting the application' }];
                    }
                    api_1.customer.customer = userData;
                    return [2 /*return*/, { success: true, message: '' }];
            }
        });
    });
};
var login = function (username, password) { return __awaiter(void 0, void 0, void 0, function () {
    var ver, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ver = electron_1.app.getVersion();
                return [4 /*yield*/, userHandlers.login(username, password, ver)];
            case 1:
                response = _a.sent();
                if (response.status === 404 || response.status === 401) {
                    return [2 /*return*/, { success: false, message: 'Incorrect username or password.' }];
                }
                return [4 /*yield*/, loadUser(true)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.loginHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, login(req.body.username, req.body.password)];
            case 1:
                response = _a.sent();
                res.json(response);
                return [2 /*return*/];
        }
    });
}); };
exports.getCurrent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (api_1.customer.customer) {
                    return [2 /*return*/, res.json(api_1.customer.customer)];
                }
                return [4 /*yield*/, loadUser()];
            case 1:
                response = _a.sent();
                if (api_1.customer.customer) {
                    return [2 /*return*/, res.json(api_1.customer.customer)];
                }
                return [2 /*return*/, res.status(403).json(response)];
        }
    });
}); };
exports.logout = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                api_1.customer.customer = null;
                return [4 /*yield*/, userHandlers.logout()];
            case 1:
                _a.sent();
                return [2 /*return*/, res.sendStatus(200)];
        }
    });
}); };
