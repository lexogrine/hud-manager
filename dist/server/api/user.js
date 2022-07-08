"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPlayersToRoom = exports.setNewRoomUUID = exports.logout = exports.getCurrent = exports.setWorkspace = exports.getWorkspaces = exports.loginHandler = exports.api = exports.verifyGame = exports.room = exports.USE_LOCAL_BACKEND = exports.socket = exports.fetch = void 0;
const electron_1 = require("electron");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const api_1 = require("./../api");
const tough_cookie_1 = require("tough-cookie");
const path_1 = __importDefault(require("path"));
const tough_cookie_file_store_1 = require("tough-cookie-file-store");
const fetch_cookie_1 = __importDefault(require("fetch-cookie"));
const machine_1 = require("./machine");
const simple_websockets_1 = require("simple-websockets");
const socket_1 = require("../socket");
const cloud_1 = require("./cloud");
const uuid_1 = require("uuid");
const database_1 = require("../../init/database");
const cookiePath = path_1.default.join(electron_1.app.getPath('userData'), 'cookie.json');
const cookieJar = new tough_cookie_1.CookieJar(new tough_cookie_file_store_1.FileCookieStore(cookiePath));
exports.fetch = (0, fetch_cookie_1.default)(node_fetch_1.default, cookieJar);
exports.socket = null;
exports.USE_LOCAL_BACKEND = false;
const domain = exports.USE_LOCAL_BACKEND ? '192.168.50.71:5000' : 'api.lhm.gg';
let cameraSupportInit = false;
const getSocket = () => {
    return exports.socket;
};
/*const initCameras = () => {
    if(cameraSupportInit) return;
    cameraSupportInit = true;

    ioPromise.then(io => {

    });
}*/
let connectedSteamids = [];
exports.room = {
    uuid: null,
    availablePlayers: [],
    password: ''
};
const socketMap = {};
setInterval(() => {
    if (!exports.socket)
        return;
    exports.socket.send('ping');
}, 45000);
const connectSocket = (forceReconnect = false) => {
    if (!exports.room.uuid) {
        exports.room.uuid = (0, uuid_1.v4)();
        console.log('CAMERA ROOM:', exports.room.uuid);
    }
    if (exports.socket) {
        if (forceReconnect) {
            exports.socket._socket.close();
        }
        return;
    }
    exports.socket = new simple_websockets_1.SimpleWebSocket(exports.USE_LOCAL_BACKEND ? `ws://${domain}` : `wss://${domain}/`, {
        headers: {
            Cookie: cookieJar.getCookieStringSync(exports.USE_LOCAL_BACKEND ? `http://${domain}/` : `https://${domain}/`)
        }
    });
    exports.socket.on('connection', () => {
        if (exports.room.uuid)
            exports.socket?.send('registerAsProxy', exports.room.uuid);
    });
    exports.socket._socket.onerror = (err) => {
        console.log(err);
    };
    exports.socket.on('banned', () => {
        socket_1.ioPromise.then(io => {
            io.emit('banned');
        });
    });
    exports.socket.on('db_update', async () => {
        console.log('DB UPDATE INCOMING');
        if (!api_1.customer.game)
            return;
        const io = await socket_1.ioPromise;
        const result = await (0, cloud_1.checkCloudStatus)(api_1.customer.game, () => {
            io.emit('match');
        });
        if (result !== 'ALL_SYNCED') {
            // TODO: Handle that
            return;
        }
        io.emit('db_update');
    });
    exports.socket.on('disconnect', () => {
        exports.socket = null;
        exports.room.uuid = null;
        exports.room.password = '';
        exports.room.availablePlayers = [];
        setTimeout(connectSocket, 500);
    });
    (0, api_1.registerRoomSetup)(exports.socket);
    socket_1.ioPromise.then(io => {
        exports.socket?.on('hudsOnline', (hudsUUID) => {
            io.to('csgo').emit('hudsOnline', hudsUUID);
        });
        exports.socket?.on('offerFromPlayer', (roomId, data, steamid, uuid) => {
            if (!exports.room.availablePlayers.find(player => player.steamid === steamid)) {
                return;
            }
            const targetSocket = socketMap[uuid];
            if (!targetSocket)
                return;
            targetSocket.emit('offerFromPlayer', roomId, data, steamid);
        });
        exports.socket?.on('playersOnline', (data) => {
            connectedSteamids = data;
            io.emit('playersOnline', data);
        });
        exports.socket?.send('getConnectedPlayers');
        if (!cameraSupportInit) {
            cameraSupportInit = true;
            io.on('offerFromHUD', (room, data, steamid, uuid) => {
                getSocket()?.send('offerFromHUD', room, data, steamid, uuid);
            });
            io.on('connection', ioSocket => {
                ioSocket.on('registerAsHUD', (room) => {
                    const sockets = Object.values(socketMap);
                    if (sockets.includes(ioSocket))
                        return;
                    const uuid = (0, uuid_1.v4)();
                    socketMap[uuid] = ioSocket;
                    ioSocket.on('disconnect', () => {
                        getSocket()?.send('unregisterAsHUD', room, uuid);
                    });
                    getSocket()?.send('registerAsHUD', room, uuid);
                });
                ioSocket.on('getConnectedPlayers', () => {
                    ioSocket.emit('playersOnline', connectedSteamids);
                });
                ioSocket.on('offerFromHUD', (room, data, steamid) => {
                    const sockets = Object.entries(socketMap);
                    const targetSocket = sockets.find(entry => entry[1] === ioSocket);
                    if (!targetSocket)
                        return;
                    getSocket()?.send('offerFromHUD', room, data, steamid, targetSocket[0]);
                });
                ioSocket.on('disconnect', () => {
                    const sockets = Object.entries(socketMap);
                    const targetSocket = sockets.find(entry => entry[1] === ioSocket);
                    if (!targetSocket)
                        return;
                    delete socketMap[targetSocket[0]];
                });
            });
        }
    });
};
const verifyGame = (req, res, next) => {
    if (!api_1.customer.game) {
        return res.sendStatus(403);
    }
    return next();
};
exports.verifyGame = verifyGame;
const api = (url, method = 'GET', body, opts) => {
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
    return (0, exports.fetch)(exports.USE_LOCAL_BACKEND ? `http://${domain}/${url}` : `https://${domain}/${url}`, options).then(res => {
        data = res;
        return res.json().catch(() => data && data.status < 300);
    });
};
exports.api = api;
const userHandlers = {
    get: (machineId, workspaceId) => (0, exports.api)(workspaceId
        ? `auth/${machineId}?teamId=${workspaceId}&version=${electron_1.app.getVersion()}`
        : `auth/${machineId}?version=${electron_1.app.getVersion()}`),
    getWorkspaces: () => (0, exports.api)(`auth/workspaces?machineId=${(0, machine_1.getMachineId)()}&version=${electron_1.app.getVersion()}`),
    login: (username, password, ver, code) => (0, exports.api)('auth', 'POST', { username, password, ver, code }),
    logout: () => (0, exports.api)('auth', 'DELETE')
};
const verifyToken = (token) => {
    try {
        const result = jsonwebtoken_1.default.decode(token /*publicKey,*/);
        //jwt.decode()
        if (result.user && result.license) {
            return result;
        }
        return false;
    }
    catch {
        return false;
    }
};
const loadUser = async (workspace, loggedIn = false) => {
    const machineId = (0, machine_1.getMachineId)();
    const userToken = await userHandlers.get(machineId, workspace?.id || null);
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
    connectSocket(true);
    api_1.customer.customer = userData;
    api_1.customer.workspace = workspace;
    await (0, database_1.loadUsersDatabase)(api_1.customer);
    if (api_1.customer.game) {
        await (0, cloud_1.checkCloudStatus)(api_1.customer.game);
    }
    socket_1.ioPromise.then(io => {
        io.emit('reload_acocs');
        io.emit('reloadHUDs');
    });
    return { success: true, message: '' };
};
const loadUserWorkspaces = async () => {
    const response = await userHandlers.getWorkspaces();
    if (!response || 'error' in response) {
        if (!response) {
            return { error: 'Not logged in' };
        }
        return response;
    }
    api_1.customer.workspaces = response;
    return response;
};
const login = async (username, password, code = '') => {
    const ver = electron_1.app.getVersion();
    const response = await userHandlers.login(username, password, ver, code);
    if (response.status === 404 || response.status === 401) {
        return { success: false, message: 'Incorrect username or password.' };
    }
    if (typeof response !== 'boolean' && 'error' in response) {
        return { success: false, message: response.error };
    }
    const workspaces = await loadUserWorkspaces();
    return { success: !('error' in workspaces) };
};
const loginHandler = async (req, res) => {
    const response = await login(req.body.username, req.body.password, req.body.token);
    res.json(response);
};
exports.loginHandler = loginHandler;
const getWorkspaces = async (req, res) => {
    return res.json({ result: api_1.customer.workspaces });
};
exports.getWorkspaces = getWorkspaces;
const setWorkspace = async (req, res) => {
    const { workspaceId } = req.body;
    if (!api_1.customer.workspaces) {
        return res.status(403).json({ success: false, message: 'No workspaces' });
    }
    if (workspaceId === null) {
        const result = await loadUser(workspaceId, true);
        if (result.success && api_1.customer.customer) {
            (0, database_1.setSessionStore)({ workspace: null });
        }
        return res.json(result);
    }
    const targetWorkspace = api_1.customer.workspaces.find(workspace => workspace.id === workspaceId);
    if (!targetWorkspace) {
        return res.status(403).json({ success: false, message: 'Bad workspace' });
    }
    const result = await loadUser(targetWorkspace, true);
    if (result.success && api_1.customer.customer) {
        (0, database_1.setSessionStore)({ workspace: targetWorkspace.id });
    }
    return res.json(result);
};
exports.setWorkspace = setWorkspace;
const getCurrent = async (req, res) => {
    if (api_1.customer.customer) {
        return res.json({ ...api_1.customer, session: database_1.sessionStoreContext.session });
    }
    const workspaces = api_1.customer.workspaces || (await loadUserWorkspaces());
    if ('error' in workspaces) {
        return res.status(403).json({ success: false, message: workspaces.error });
    }
    if (workspaces.length > 1) {
        return res.json({ ...api_1.customer, session: database_1.sessionStoreContext.session });
    }
    const result = await loadUser(null, true);
    if (result.success) {
        (0, database_1.setSessionStore)({ workspace: null });
        return res.json({ ...api_1.customer, session: database_1.sessionStoreContext.session });
    }
    return res.json(result);
};
exports.getCurrent = getCurrent;
const logout = async (req, res) => {
    api_1.customer.customer = null;
    api_1.customer.workspaces = null;
    api_1.customer.workspace = null;
    await userHandlers.logout();
    if (exports.socket) {
        exports.socket._socket.close();
    }
    await loadUserWorkspaces();
    (0, database_1.setSessionStore)({ workspace: null, game: null });
    return res.sendStatus(200);
};
exports.logout = logout;
const setNewRoomUUID = async (req, res) => {
    if (!exports.socket) {
        return res.sendStatus(500);
    }
    exports.room.uuid = (0, uuid_1.v4)();
    await (0, api_1.registerRoomSetup)(exports.socket);
    setTimeout(() => {
        (0, exports.sendPlayersToRoom)({ players: exports.room.availablePlayers, password: '' });
        res.sendStatus(200);
    }, 500);
};
exports.setNewRoomUUID = setNewRoomUUID;
const sendPlayersToRoom = async (input, statusToggling = false) => {
    if (!Array.isArray(input.players) ||
        !input.players.every(x => typeof x === 'object' && x && typeof x.steamid === 'string' && typeof x.label === 'string')) {
        return false;
    }
    const io = await socket_1.ioPromise;
    exports.room.availablePlayers = input.players;
    exports.room.password = input.password;
    if (statusToggling) {
        io.to('game').emit('playersCameraStatus', exports.room.availablePlayers);
    }
    setTimeout(() => {
        (0, exports.fetch)(`${exports.USE_LOCAL_BACKEND ? `http://${domain}` : `https://${domain}`}/cameras/setup/${exports.room.uuid}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ players: [...exports.room.availablePlayers], password: exports.room.password })
        })
            .then(res => res.text())
            .then(value => {
            fs_1.default.writeFileSync(path_1.default.join(electron_1.app.getPath('userData'), 'errors', `${new Date().getTime()}.txt`), `Trying to update ${exports.room.uuid} with ${JSON.stringify([
                ...exports.room.availablePlayers
            ])}. Response: ${value}`);
        })
            .catch(reason => {
            fs_1.default.writeFileSync(path_1.default.join(electron_1.app.getPath('userData'), 'errors', `${new Date().getTime()}.txt`), reason);
        });
    }, 1000);
    return true;
};
exports.sendPlayersToRoom = sendPlayersToRoom;
