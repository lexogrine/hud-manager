"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendKillsToARG = exports.connectToARG = exports.sendARGStatus = exports.getIP = exports.argSocket = void 0;
const socket_1 = require("../../socket");
const socket_io_client_1 = require("socket.io-client");
exports.argSocket = {
    delay: 7,
    socket: null,
    id: null
};
const getIP = (code) => {
    const ipNumbers = code.split('-').map(n => parseInt(n, 16));
    const port = ipNumbers.pop();
    const ip = `${ipNumbers.join('.')}:${port}`;
    const address = `http://${ip}`;
    return address;
};
exports.getIP = getIP;
const sendARGStatus = async () => {
    const io = await socket_1.ioPromise;
    io.emit('ARGStatus', exports.argSocket?.id, exports.argSocket.delay);
};
exports.sendARGStatus = sendARGStatus;
const connectToARG = (code) => {
    if (exports.argSocket.socket) {
        console.log('jest socket juz');
        return;
    }
    const socketAddress = exports.getIP(code);
    console.log('trying to connect to', socketAddress);
    const onClose = (err) => {
        console.log(err);
        exports.argSocket.socket = null;
        exports.argSocket.id = null;
        exports.sendARGStatus();
    };
    const socket = socket_io_client_1.io(socketAddress);
    socket.on('connect', () => {
        socket.emit('register');
    });
    socket.on('registered', exports.sendARGStatus);
    exports.argSocket.socket = socket;
    exports.argSocket.id = code;
    socket.on('error', onClose);
    socket.on('disconnect', onClose);
};
exports.connectToARG = connectToARG;
const getNewKills = (kill, oldKillsStatistics) => {
    const oldKillEntry = oldKillsStatistics.find(entry => entry.steamid === kill.steamid);
    if (!oldKillEntry)
        return 0;
    if (kill.kills - oldKillEntry.kills < 0)
        return 0;
    return kill.kills - oldKillEntry.kills;
};
const sendKillsToARG = (last, csgo) => {
    if (last.round?.phase === 'freezetime' && csgo.round?.phase !== 'freezetime' && exports.argSocket.socket) {
        exports.argSocket.socket.emit('clear');
    }
    const playerKills = csgo.players.map(player => ({
        steamid: player.steamid,
        kills: player.stats.kills,
        health: player.state.health,
        name: player.name
    }));
    const oldPlayerKills = last.players.map(player => ({
        steamid: player.steamid,
        kills: player.stats.kills,
        health: player.state.health,
        name: player.name
    }));
    const argKillEntries = [];
    for (const playerKill of playerKills) {
        const newKills = getNewKills(playerKill, oldPlayerKills);
        if (!newKills)
            continue;
        argKillEntries.push({
            killer: playerKill.steamid,
            timestamp: new Date().getTime() + exports.argSocket.delay * 1000,
            round: csgo.map.round,
            killerHealth: playerKill.health,
            newKills,
            name: playerKill.name
        });
    }
    if (exports.argSocket.socket && argKillEntries.length) {
        exports.argSocket.socket.emit('kills', argKillEntries);
    }
};
exports.sendKillsToARG = sendKillsToARG;
