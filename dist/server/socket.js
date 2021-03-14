"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioPromise = exports.GSI = exports.HUDState = exports.runtimeConfig = void 0;
const socket_io_1 = require("socket.io");
const csgogsi_socket_1 = require("csgogsi-socket");
const node_fetch_1 = __importDefault(require("node-fetch"));
const matches_1 = require("./api/matches");
const config_1 = require("./api/config");
const tournaments_1 = require("./api/tournaments");
const api_1 = require("./api");
const electron_1 = require("../electron");
const hlae_1 = __importDefault(require("./hlae"));
const _1 = require(".");
const hudstatemanager_1 = require("./api/huds/hudstatemanager");
require("./api/huds/devhud");
const radar = require('./../boltobserv/index.js');
let lastUpdate = new Date().getTime();
exports.runtimeConfig = {
    last: null,
    devSocket: null,
    currentHUD: null
};
exports.HUDState = new hudstatemanager_1.HUDStateManager();
exports.GSI = new csgogsi_socket_1.CSGOGSI();
exports.ioPromise = config_1.loadConfig().then(cfg => {
    const corsOrigins = [`http://${config_1.internalIP}:${cfg.port}`, `http://localhost:${cfg.port}`];
    if (config_1.publicIP) {
        corsOrigins.push(`http://${config_1.publicIP}:${cfg.port}`);
    }
    if (electron_1.isDev) {
        corsOrigins.push('http://localhost:3000');
    }
    return new socket_io_1.Server(_1.server, {
        allowEIO3: true,
        cors: {
            origin: corsOrigins,
            credentials: true
        }
    });
});
exports.ioPromise.then(io => {
    radar.startRadar(_1.app, io);
    hlae_1.default();
    const onRoundEnd = async (score) => {
        const lastGSIEntry = exports.GSI.last;
        if (lastGSIEntry)
            await matches_1.updateRound(lastGSIEntry);
        if (score.loser && score.loser.logo) {
            score.loser.logo = '';
        }
        if (score.winner && score.winner.logo) {
            score.winner.logo = '';
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
            if (score.mapEnd) {
                veto.winner =
                    score.map.team_ct.score > score.map.team_t.score ? score.map.team_ct.id : score.map.team_t.id;
                if (veto.reverseSide) {
                    veto.winner =
                        score.map.team_ct.score > score.map.team_t.score ? score.map.team_t.id : score.map.team_ct.id;
                }
                if (match.left.id === score.winner.id) {
                    if (veto.reverseSide) {
                        match.right.wins++;
                    }
                    else {
                        match.left.wins++;
                    }
                }
                else if (match.right.id === score.winner.id) {
                    if (veto.reverseSide) {
                        match.left.wins++;
                    }
                    else {
                        match.right.wins++;
                    }
                }
                if (lastGSIEntry) {
                    veto.game = lastGSIEntry;
                }
                veto.mapEnd = true;
            }
            return veto;
        });
        match.vetos = vetos;
        await matches_1.updateMatch(match);
        if (score.mapEnd) {
            await tournaments_1.createNextMatch(match.id);
        }
        io.emit('match', true);
    };
    exports.GSI.on('roundEnd', onRoundEnd);
    exports.GSI.on('data', data => {
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
    return io;
});
