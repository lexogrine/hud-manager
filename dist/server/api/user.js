"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getCurrent = exports.loginHandler = exports.api = exports.verifyGame = exports.socket = exports.fetch = void 0;
const electron_1 = require("electron");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const publickey_1 = require("./publickey");
const api_1 = require("./../api");
const tough_cookie_1 = require("tough-cookie");
const path_1 = __importDefault(require("path"));
const tough_cookie_file_store_1 = require("tough-cookie-file-store");
const fetch_cookie_1 = __importDefault(require("fetch-cookie"));
const machine_1 = require("./machine");
const simple_websockets_1 = require("simple-websockets");
const socket_1 = require("../socket");
const cloud_1 = require("./cloud");
const cookiePath = path_1.default.join(electron_1.app.getPath('userData'), 'cookie.json');
const cookieJar = new tough_cookie_1.CookieJar(new tough_cookie_file_store_1.FileCookieStore(cookiePath));
exports.fetch = fetch_cookie_1.default(node_fetch_1.default, cookieJar);
exports.socket = null;
const USE_LOCAL_BACKEND = false;
const connectSocket = () => {
    if (exports.socket)
        return;
    exports.socket = new simple_websockets_1.SimpleWebSocket(USE_LOCAL_BACKEND ? 'ws://localhost:5000' : 'wss://hmapi.lexogrine.com/', {
        headers: {
            Cookie: cookieJar.getCookieStringSync(USE_LOCAL_BACKEND ? 'http://localhost:5000/' : 'https://hmapi.lexogrine.com/')
        }
    });
    exports.socket.on('connection', () => {
        console.log('CONNECTED');
    });
    exports.socket._socket.onerror = (err) => { console.log(err); };
    exports.socket.on('banned', () => {
        socket_1.ioPromise.then(io => {
            io.emit('banned');
        });
    });
    exports.socket.on('db_update', async () => {
        if (!api_1.customer.game)
            return;
        const io = await socket_1.ioPromise;
        const result = await cloud_1.checkCloudStatus(api_1.customer.game);
        if (result !== 'ALL_SYNCED') {
            // TODO: Handle that
            return;
        }
        io.emit('db_update');
    });
    exports.socket.on('disconnect', () => {
        exports.socket = null;
        setTimeout(connectSocket, 2000);
    });
};
exports.verifyGame = (req, res, next) => {
    if (!api_1.customer.game) {
        return res.sendStatus(403);
    }
    return next();
};
exports.api = (url, method = 'GET', body, opts) => {
    const options = opts || {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    let data = null;
    return exports.fetch(USE_LOCAL_BACKEND ? `http://localhost:5000/${url}` : `https://hmapi.lexogrine.com/${url}`, options).then(res => {
        data = res;
        return res.json().catch(() => data && data.status < 300);
    });
};
const userHandlers = {
    get: (machineId) => exports.api(`auth/${machineId}`),
    login: (username, password, ver) => exports.api('auth', 'POST', { username, password, ver }),
    logout: () => exports.api('auth', 'DELETE')
};
const verifyToken = (token) => {
    try {
        const result = jsonwebtoken_1.default.verify(token, publickey_1.publicKey, { algorithms: ['RS256'] });
        if (result.user && result.license) {
            return result;
        }
        return false;
    }
    catch {
        return false;
    }
};
const loadUser = async (loggedIn = false) => {
    const machineId = machine_1.getMachineId();
    const userToken = await userHandlers.get(machineId);
    if (!userToken) {
        return { success: false, message: loggedIn ? 'Your session has expired - try restarting the application' : '' };
    }
    if (typeof userToken !== 'boolean' && 'error' in userToken) {
        return { success: false, message: userToken.error };
    }
    const userData = verifyToken(userToken.token);
    if (!userData) {
        return { success: false, message: 'Your session has expired - try restarting the application' };
    }
    connectSocket();
    api_1.customer.customer = userData;
    return { success: true, message: '' };
};
const login = async (username, password) => {
    const ver = electron_1.app.getVersion();
    const response = await userHandlers.login(username, password, ver);
    if (response.status === 404 || response.status === 401) {
        return { success: false, message: 'Incorrect username or password.' };
    }
    if (typeof response !== 'boolean' && 'error' in response) {
        return { success: false, message: response.error };
    }
    return await loadUser(true);
};
exports.loginHandler = async (req, res) => {
    const response = await login(req.body.username, req.body.password);
    res.json(response);
};
exports.getCurrent = async (req, res) => {
    if (api_1.customer.customer) {
        return res.json(api_1.customer.customer);
    }
    const response = await loadUser();
    if (api_1.customer.customer) {
        if (api_1.customer.customer.license.type === 'professional') {
        }
        return res.json(api_1.customer.customer);
    }
    return res.status(403).json(response);
};
exports.logout = async (req, res) => {
    api_1.customer.customer = null;
    if (exports.socket) {
        exports.socket._socket.close();
    }
    await userHandlers.logout();
    return res.sendStatus(200);
};
