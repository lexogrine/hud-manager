"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConfigToARG = exports.sendKillsToARG = exports.parseCSGOKills = exports.connectToARG = exports.sendARGStatus = exports.getIP = exports.argSocket = void 0;
const socket_1 = require("../../socket");
const simple_websockets_1 = require("simple-websockets");
const wait = (ms) => new Promise(r => setTimeout(r, ms));
exports.argSocket = {
    delay: 5,
    socket: null,
    id: null,
    preTime: 1500,
    postTime: 1500,
    online: true,
    useHLAE: false,
    order: [
        {
            id: 'multikills',
            text: 'Prioritize multi kills',
            active: true
        },
        {
            id: 'headshots',
            text: 'Prioritize headshots',
            active: true
        },
        {
            id: 'teamkill',
            text: 'Prioritize team kills',
            active: false
        }
    ],
    saveClips: false
};
const getIP = (code) => {
    const ipNumbers = code.split('-').map(n => parseInt(n, 16));
    const port = ipNumbers.pop();
    const ip = `${ipNumbers.join('.')}:${port}`;
    const address = `ws://${ip}`;
    return address;
};
exports.getIP = getIP;
const sendARGStatus = async () => {
    const io = await socket_1.ioPromise;
    const status = {
        pcID: exports.argSocket?.id,
        online: exports.argSocket.online,
        delay: exports.argSocket.delay,
        useHLAE: exports.argSocket.useHLAE,
        saveClips: exports.argSocket.saveClips,
        safeBand: { preTime: exports.argSocket.preTime, postTime: exports.argSocket.postTime }
    };
    io.emit('ARGStatus', status);
};
exports.sendARGStatus = sendARGStatus;
const connectToARG = (code) => {
    if (exports.argSocket.socket) {
        return;
    }
    const socketAddress = (0, exports.getIP)(code);
    const onClose = () => {
        exports.argSocket.socket = null;
        exports.argSocket.id = null;
        (0, exports.sendARGStatus)();
    };
    const socket = new simple_websockets_1.SimpleWebSocket(socketAddress);
    socket.on('connection', () => {
        (0, exports.sendConfigToARG)(true);
    });
    socket.on('ntpPing', async (t1) => {
        const t2 = Date.now();
        await wait(1000);
        socket.send('ntpPong', t1, t2, Date.now());
    });
    socket.on('registered', exports.sendARGStatus);
    exports.argSocket.socket = socket;
    exports.argSocket.id = code;
    if ('on' in socket._socket) {
        socket._socket.on('error', onClose);
        socket._socket.on('close', onClose);
    }
};
exports.connectToARG = connectToARG;
const getNewKills = (kill, oldKillsStatistics) => {
    const oldKillEntry = oldKillsStatistics.find(entry => entry.steamid === kill.steamid);
    if (!oldKillEntry)
        return { kills: 0, headshot: false, teamkill: false };
    if (kill.kills - oldKillEntry.kills < 0)
        return { kills: 0, headshot: false, teamkill: true };
    return {
        kills: kill.kills - oldKillEntry.kills,
        headshot: kill.headshots > oldKillEntry.headshots,
        teamkill: false
    };
};
const parseCSGOKills = (last, csgo) => {
    const playerKills = csgo.players.map(player => ({
        steamid: player.steamid,
        kills: player.stats.kills,
        health: player.state.health,
        name: player.name,
        headshots: player.state.round_killhs
    }));
    const oldPlayerKills = last.players.map(player => ({
        steamid: player.steamid,
        kills: player.stats.kills,
        health: player.state.health,
        name: player.name,
        headshots: player.state.round_killhs
    }));
    const argKillEntries = [];
    for (const playerKill of playerKills) {
        const newKills = getNewKills(playerKill, oldPlayerKills);
        if (!newKills.kills)
            continue;
        argKillEntries.push({
            killer: playerKill.steamid,
            timestamp: new Date().getTime() + exports.argSocket.delay * 1000,
            round: csgo.map.round,
            killerHealth: playerKill.health,
            newKills: newKills.kills,
            name: playerKill.name,
            teamkill: newKills.teamkill,
            headshot: newKills.headshot
        });
    }
    if (!exports.argSocket.useHLAE)
        (0, exports.sendKillsToARG)(argKillEntries);
    setTimeout(() => {
        if (!exports.argSocket.online)
            return;
        if (last.round?.phase === 'freezetime' && csgo.round?.phase === 'live' && exports.argSocket.socket) {
            exports.argSocket.socket.send('clearReplay');
        }
        else if (csgo.round?.phase === 'freezetime' && last.round?.phase !== 'freezetime' && exports.argSocket.socket) {
            exports.argSocket.socket.send('showReplay');
        }
    }, 100);
};
exports.parseCSGOKills = parseCSGOKills;
const sendKillsToARG = (kills) => {
    if (exports.argSocket.socket && kills.length && exports.argSocket.online) {
        exports.argSocket.socket.send('kills', kills);
    }
};
exports.sendKillsToARG = sendKillsToARG;
const sendConfigToARG = (register = false) => {
    const args = [
        exports.argSocket.order.map(item => ({ id: item.id, active: item.active })),
        exports.argSocket.saveClips,
        { preTime: exports.argSocket.preTime, postTime: exports.argSocket.postTime }
    ];
    exports.argSocket.socket?.send(register ? 'register' : 'config', ...args);
};
exports.sendConfigToARG = sendConfigToARG;
