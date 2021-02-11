"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSI = exports.HUDState = exports.Sockets = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const csgogsi_1 = __importDefault(require("csgogsi"));
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const huds_1 = require("./../server/api/huds");
const matches_1 = require("./api/matches");
const fs_1 = __importDefault(require("fs"));
const portscanner_1 = __importDefault(require("portscanner"));
const config_1 = require("./api/config");
const testing_1 = require("./api/testing");
const teams_1 = require("./api/teams");
const players_1 = require("./api/players");
const tournaments_1 = require("./api/tournaments");
const api_1 = require("./api");
const server_1 = __importDefault(require("./server"));
const radar = require('./../boltobserv/index.js');
//const mirv = require('./server').default;
class DevHUDListener {
    constructor(port) {
        this.checkPort = () => {
            portscanner_1.default.checkPortStatus(this.port, '127.0.0.1', (err, portStatus) => {
                const status = portStatus === 'open';
                if (status !== this.status) {
                    this.callback(status);
                }
                this.status = status;
            });
            /**/
        };
        this.port = port;
        this.status = false;
        this.callback = () => { };
        this.interval = -1;
    }
    onChange(callback) {
        this.callback = callback;
    }
    start() {
        if (this.interval !== -1)
            return;
        const id = setInterval(this.checkPort, 3000);
        this.interval = id;
    }
    stop() {
        clearInterval(this.interval);
    }
}
let HUDStateManager = /** @class */ (() => {
    class HUDStateManager {
        constructor() {
            this.data = new Map();
            this.devHUD = null;
        }
        async save(hud, data) {
            const hudPath = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', hud);
            if (!fs_1.default.existsSync(hudPath))
                return;
            fs_1.default.writeFileSync(path_1.default.join(hudPath, 'config.hm'), JSON.stringify(data));
        }
        set(hud, section, data) {
            const form = this.get(hud);
            const newForm = { ...form, [section]: data };
            this.save(hud, newForm);
            this.data.set(hud, newForm);
        }
        get(hud, force = false) {
            const hudData = this.data.get(hud);
            const hudPath = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', hud);
            const hudConfig = path_1.default.join(hudPath, 'config.hm');
            if (hudData || !force || !fs_1.default.existsSync(hudPath) || !fs_1.default.existsSync(hudConfig))
                return hudData;
            const rawData = fs_1.default.readFileSync(hudConfig, 'utf8');
            try {
                const data = JSON.parse(rawData);
                return this.data.set(hud, data).get(hud);
            }
            catch {
                return undefined;
            }
        }
    }
    HUDStateManager.extend = async (hudData) => {
        if (!hudData || typeof hudData !== 'object')
            return hudData;
        for (const data of Object.values(hudData)) {
            if (!data || typeof data !== 'object')
                return hudData;
            const entries = Object.values(data);
            for (const entry of entries) {
                if (!entry || typeof entry !== 'object')
                    continue;
                if (!('type' in entry) || !('id' in entry))
                    continue;
                let extraData;
                switch (entry.type) {
                    case 'match':
                        extraData = await matches_1.getMatchById(entry.id);
                        break;
                    case 'player':
                        extraData = await players_1.getPlayerById(entry.id);
                        break;
                    case 'team':
                        extraData = await teams_1.getTeamById(entry.id);
                        break;
                    default:
                        continue;
                }
                entry[entry.type] = extraData;
            }
        }
        return hudData;
    };
    return HUDStateManager;
})();
class SocketManager {
    constructor(io) {
        this.io = io || null;
    }
    set(io) {
        this.io = io;
    }
}
let lastUpdate = new Date().getTime();
exports.Sockets = new SocketManager();
exports.HUDState = new HUDStateManager();
exports.GSI = new csgogsi_1.default();
const assertUser = (req, res, next) => {
    if (!api_1.customer.customer) {
        return res.sendStatus(403);
    }
    return next();
};
function default_1(server, app) {
    const getJSONArray = url => {
        return node_fetch_1.default(url)
            .then(res => res.json())
            .then(panel => {
            try {
                if (!panel)
                    return [];
                if (!Array.isArray(panel))
                    return [];
                return panel;
            }
            catch {
                return [];
            }
        })
            .catch(() => []);
    };
    const runtimeConfig = {
        last: null,
        devSocket: null,
        currentHUD: null
    };
    const io = socket_io_1.default(server);
    let intervalId = null;
    let testDataIndex = 0;
    const startSendingTestData = () => {
        if (intervalId)
            return;
        if (runtimeConfig.last?.provider?.timestamp &&
            new Date().getTime() - runtimeConfig.last.provider.timestamp * 1000 <= 5000)
            return;
        io.emit('enableTest', false);
        intervalId = setInterval(() => {
            if (!testing_1.testData[testDataIndex]) {
                stopSendingTestData();
                testDataIndex = 0;
                return;
            }
            io.to('csgo').emit('update', testing_1.testData[testDataIndex]);
            testDataIndex++;
        }, 16);
    };
    const stopSendingTestData = () => {
        if (!intervalId)
            return;
        clearInterval(intervalId);
        intervalId = null;
        io.emit('enableTest', true);
    };
    exports.Sockets.set(io);
    const portListener = new DevHUDListener(3500);
    portListener.onChange(status => {
        if (!status) {
            exports.HUDState.devHUD = null;
            return io.emit('reloadHUDs');
        }
        if (exports.HUDState.devHUD)
            return;
        node_fetch_1.default('http://localhost:3500/dev/hud.json')
            .then(res => res.json())
            .then(async (hud) => {
            try {
                if (!hud)
                    return;
                if (!hud || !hud.version || !hud.author)
                    return;
                hud.keybinds = await getJSONArray('http://localhost:3500/dev/keybinds.json');
                hud.panel = await getJSONArray('http://localhost:3500/dev/panel.json');
                hud.isDev = true;
                hud.dir = (Math.random() * 1000 + 1)
                    .toString(36)
                    .replace(/[^a-z]+/g, '')
                    .substr(0, 15);
                const cfg = await config_1.loadConfig();
                if (!cfg) {
                    return;
                }
                hud.url = `http://${config_1.internalIP}:${cfg.port}/development/`;
                exports.HUDState.devHUD = hud;
                if (runtimeConfig.devSocket) {
                    const hudData = exports.HUDState.get(hud.dir);
                    const extended = await HUDStateManager.extend(hudData);
                    io.to(hud.dir).emit('hud_config', extended);
                }
            }
            catch { }
            io.emit('reloadHUDs');
        })
            .catch(() => {
            return io.emit('reloadHUDs');
        });
    });
    portListener.start();
    const customRadarCSS = async (req, res) => {
        const sendDefault = () => res.sendFile(path_1.default.join(__dirname, '../boltobserv', 'css', `custom.css`));
        if (!req.query.hud || typeof req.query.hud !== 'string') {
            return sendDefault();
        }
        const hud = await huds_1.getHUDData(req.query.hud);
        if (!hud?.boltobserv?.css)
            return sendDefault();
        const dir = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
        return res.sendFile(path_1.default.join(dir, 'radar.css'));
    };
    app.get('/boltobserv/css/custom.css', customRadarCSS);
    app.get('/huds/:hud/custom.css', (req, res, next) => {
        req.query.hud = req.params.hud;
        return customRadarCSS(req, res, next);
    });
    app.get('/boltobserv/maps/:mapName/meta.json5', async (req, res) => {
        const sendDefault = () => res.sendFile(path_1.default.join(__dirname, '../boltobserv', 'maps', req.params.mapName, 'meta.json5'));
        if (!req.params.mapName) {
            return res.sendStatus(404);
        }
        if (req.query.dev === 'true') {
            try {
                const result = await node_fetch_1.default(`http://localhost:3500/maps/${req.params.mapName}/meta.json5`, {});
                return res.send(await result.text());
            }
            catch {
                return sendDefault();
            }
        }
        if (!req.query.hud || typeof req.query.hud !== 'string')
            return sendDefault();
        const hud = await huds_1.getHUDData(req.query.hud);
        if (!hud?.boltobserv?.maps)
            return sendDefault();
        const dir = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
        const pathFile = path_1.default.join(dir, 'maps', req.params.mapName, 'meta.json5');
        if (!fs_1.default.existsSync(pathFile))
            return sendDefault();
        return res.sendFile(pathFile);
    });
    app.get('/boltobserv/maps/:mapName/radar.png', async (req, res) => {
        const sendDefault = () => res.sendFile(path_1.default.join(__dirname, '../boltobserv', 'maps', req.params.mapName, 'radar.png'));
        if (!req.params.mapName) {
            return res.sendStatus(404);
        }
        if (!req.query.hud || typeof req.query.hud !== 'string')
            return sendDefault();
        const hud = await huds_1.getHUDData(req.query.hud);
        if (!hud?.boltobserv?.maps)
            return sendDefault();
        const dir = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', req.query.hud);
        const pathFile = path_1.default.join(dir, 'maps', req.params.mapName, 'radar.png');
        if (!fs_1.default.existsSync(pathFile))
            return sendDefault();
        return res.sendFile(pathFile);
    });
    radar.startRadar(app, io);
    app.post('/', assertUser, (req, res) => {
        if (!api_1.customer.customer) {
            return res.sendStatus(200);
        }
        runtimeConfig.last = req.body;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            io.emit('enableTest', true);
        }
        io.to('csgo').emit('update', req.body);
        exports.GSI.digest(req.body);
        radar.digestRadar(req.body);
        res.sendStatus(200);
    });
    app.post('/api/test', assertUser, (_req, res) => {
        res.sendStatus(200);
        if (intervalId)
            stopSendingTestData();
        else
            startSendingTestData();
    });
    io.on('connection', socket => {
        const ref = socket.request?.headers?.referer || '';
        config_1.verifyUrl(ref).then(status => {
            if (status) {
                socket.join('csgo');
            }
        });
        socket.on('started', () => {
            if (runtimeConfig.last) {
                socket.emit('update', runtimeConfig.last);
            }
        });
        socket.on('registerReader', () => {
            socket.on('readerKeybindAction', (dir, action) => {
                io.to(dir).emit('keybindAction', action);
            });
            socket.on('readerReverseSide', () => {
                matches_1.reverseSide(io);
            });
        });
        socket.emit('readyToRegister');
        socket.on('register', async (name, isDev) => {
            if (!isDev) {
                socket.join(name);
                const hudData = exports.HUDState.get(name, true);
                const extended = await HUDStateManager.extend(hudData);
                io.to(name).emit('hud_config', extended);
                return;
            }
            runtimeConfig.devSocket = socket;
            if (exports.HUDState.devHUD) {
                socket.join(exports.HUDState.devHUD.dir);
                const hudData = exports.HUDState.get(exports.HUDState.devHUD.dir);
                const extended = await HUDStateManager.extend(hudData);
                io.to(exports.HUDState.devHUD.dir).emit('hud_config', extended);
            }
        });
        socket.on('hud_config', async (data) => {
            exports.HUDState.set(data.hud, data.section, data.config);
            const hudData = exports.HUDState.get(data.hud);
            const extended = await HUDStateManager.extend(hudData);
            io.to(data.hud).emit('hud_config', extended);
        });
        socket.on('hud_action', (data) => {
            io.to(data.hud).emit(`hud_action`, data.action);
        });
        socket.on('get_config', (hud) => {
            socket.emit('hud_config', exports.HUDState.get(hud, true));
        });
        socket.on('set_active_hlae', (hudUrl) => {
            if (runtimeConfig.currentHUD === hudUrl) {
                runtimeConfig.currentHUD = null;
            }
            else {
                runtimeConfig.currentHUD = hudUrl;
            }
            io.emit('active_hlae', runtimeConfig.currentHUD);
        });
        socket.on('get_active_hlae', () => {
            io.emit('active_hlae', runtimeConfig.currentHUD);
        });
    });
    server_1.default((data) => {
        io.to('csgo').emit('update_mirv', data);
    });
    //GSI.on('data', updateRound);
    const onRoundEnd = async (score) => {
        if (score.loser && score.loser.logo) {
            delete score.loser.logo;
        }
        if (score.winner && score.winner.logo) {
            delete score.winner.logo;
        }
        const matches = await matches_1.getMatches();
        const match = matches.filter(match => match.current)[0];
        if (!match)
            return;
        const { vetos } = match;
        const mapName = score.map.name.substring(score.map.name.lastIndexOf('/') + 1);
        vetos.map(veto => {
            if (veto.mapName !== mapName || !score.map.team_ct.id || !score.map.team_t.id || veto.mapEnd) {
                return veto;
            }
            if (!veto.score) {
                veto.score = {};
            }
            veto.score[score.map.team_ct.id] = score.map.team_ct.score;
            veto.score[score.map.team_t.id] = score.map.team_t.score;
            if (veto.reverseSide) {
                veto.score[score.map.team_t.id] = score.map.team_ct.score;
                veto.score[score.map.team_ct.id] = score.map.team_t.score;
            }
            return veto;
        });
        match.vetos = vetos;
        await matches_1.updateMatch(match);
        io.emit('match', true);
    };
    const onMatchEnd = async (score) => {
        const matches = await matches_1.getMatches();
        const match = matches.filter(match => match.current)[0];
        const mapName = score.map.name.substring(score.map.name.lastIndexOf('/') + 1);
        if (match) {
            const { vetos } = match;
            const isReversed = vetos.filter(veto => veto.mapName === mapName && veto.reverseSide)[0];
            vetos.map(veto => {
                if (veto.mapName !== mapName || !score.map.team_ct.id || !score.map.team_t.id) {
                    return veto;
                }
                veto.winner =
                    score.map.team_ct.score > score.map.team_t.score ? score.map.team_ct.id : score.map.team_t.id;
                if (isReversed) {
                    veto.winner =
                        score.map.team_ct.score > score.map.team_t.score ? score.map.team_t.id : score.map.team_ct.id;
                }
                if (veto.score && veto.score[veto.winner]) {
                    veto.score[veto.winner]++;
                }
                veto.mapEnd = true;
                return veto;
            });
            if (match.left.id === score.winner.id) {
                if (isReversed) {
                    match.right.wins++;
                }
                else {
                    match.left.wins++;
                }
            }
            else if (match.right.id === score.winner.id) {
                if (isReversed) {
                    match.left.wins++;
                }
                else {
                    match.right.wins++;
                }
            }
            match.vetos = vetos;
            await matches_1.updateMatch(match);
            await tournaments_1.createNextMatch(match.id);
            io.emit('match', true);
        }
    };
    let last;
    exports.GSI.on('data', async (data) => {
        await matches_1.updateRound(data);
        if ((last?.map.team_ct.score !== data.map.team_ct.score) !==
            (last?.map.team_t.score !== data.map.team_t.score)) {
            if (last?.map.team_ct.score !== data.map.team_ct.score) {
                const round = {
                    winner: data.map.team_ct,
                    loser: data.map.team_t,
                    map: data.map,
                    mapEnd: false
                };
                await onRoundEnd(round);
            }
            else {
                const round = {
                    winner: data.map.team_t,
                    loser: data.map.team_ct,
                    map: data.map,
                    mapEnd: false
                };
                await onRoundEnd(round);
            }
        }
        if (data.map.phase === 'gameover' && last.map.phase !== 'gameover') {
            const winner = data.map.team_ct.score > data.map.team_t.score ? data.map.team_ct : data.map.team_t;
            const loser = data.map.team_ct.score > data.map.team_t.score ? data.map.team_t : data.map.team_ct;
            const final = {
                winner,
                loser,
                map: data.map,
                mapEnd: true
            };
            await onMatchEnd(final);
        }
        last = exports.GSI.last;
        const now = new Date().getTime();
        if (now - lastUpdate > 300000 && api_1.customer.customer) {
            lastUpdate = new Date().getTime();
            const payload = {
                players: data.players.map(player => player.name),
                ct: {
                    name: data.map.team_ct.name,
                    score: data.map.team_ct.score
                },
                t: {
                    name: data.map.team_t.name,
                    score: data.map.team_t.score
                },
                user: api_1.customer.customer.user.id
            };
            try {
                node_fetch_1.default(`https://hmapi.lexogrine.com/users/payload`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            }
            catch { }
        }
    });
    //GSI.on('roundEnd', onRoundEnd);
    //GSI.on('matchEnd', onMatchEnd);
    return io;
}
exports.default = default_1;
