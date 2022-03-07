"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCloudStatus = exports.uploadLocalToCloud = exports.downloadCloudToLocal = exports.getResource = exports.deleteResource = exports.updateResource = exports.addResource = exports.getSize = exports.updateLastDateLocallyOnly = void 0;
const user_1 = require("./../user");
const I = __importStar(require("../../../types/interfaces"));
const config_1 = require("../config");
const players_1 = require("../players");
const teams_1 = require("../teams");
const aco_1 = require("../aco");
const matches_1 = require("../matches");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const fields_1 = require("../fields");
const Sentry = __importStar(require("@sentry/node"));
const middlewares_1 = require("../tournaments/middlewares");
const tournaments_1 = require("../tournaments");
const middlewares_2 = require("./middlewares");
const socket_1 = require("../../socket");
const utils_1 = require("../../../src/utils");
const database_1 = require("../../../init/database");
const spaceLimit = {
    enterprise: Infinity,
    professional: 1024 * 1024 * 1024,
    personal: 1024 * 1024 * 100,
    free: 0
};
const cloudErrorHandler = () => { };
const getResources = (game) => {
    return Promise.all([
        (0, players_1.getPlayersList)({ game }),
        (0, teams_1.getTeamsList)({ game }),
        (0, fields_1.getCustomFieldsDb)(game),
        (0, aco_1.getACOs)(),
        (0, matches_1.getActiveGameMatches)(),
        (0, tournaments_1.getTournaments)({ game })
    ]);
};
const getLastUpdateDateLocally = () => {
    const database = path_1.default.join((0, database_1.getBasePath)(__1.customer), 'lastUpdated.lhm');
    let lastUpdated = {};
    let saveOnFinish = true;
    try {
        if (fs_1.default.existsSync(database)) {
            saveOnFinish = false;
            lastUpdated = JSON.parse(fs_1.default.readFileSync(database, 'utf8'));
        }
        for (const game of I.availableGames) {
            if (!lastUpdated[game]) {
                lastUpdated[game] = {};
            }
            //if (!lastUpdated[game][resource]) lastUpdated[game][resource] = new Date(0).toISOString();
        }
        if (saveOnFinish) {
            fs_1.default.writeFileSync(database, JSON.stringify(lastUpdated), 'utf8');
        }
        return lastUpdated;
    }
    catch (e) {
        Sentry.captureException(e);
        for (const game of I.availableGames) {
            if (!lastUpdated[game]) {
                lastUpdated[game] = {};
            }
            //if (!lastUpdated[game][resource]) lastUpdated[game][resource] = new Date(0).toISOString();
        }
        if (saveOnFinish) {
            fs_1.default.writeFileSync(database, JSON.stringify(lastUpdated), 'utf8');
        }
        return lastUpdated;
    }
};
const updateLastDateLocally = (game, resources, blockUpdate = false) => {
    const lastUpdateLocal = getLastUpdateDateLocally();
    for (const resourceInfo of resources) {
        lastUpdateLocal[game][resourceInfo.resource] = resourceInfo.status;
    }
    const database = path_1.default.join((0, database_1.getBasePath)(__1.customer), 'lastUpdated.lhm');
    fs_1.default.writeFileSync(database, JSON.stringify(lastUpdateLocal), 'utf8');
    if (user_1.socket && !blockUpdate) {
        user_1.socket.send('init_db_update', __1.customer.workspace?.id || null);
    }
    return lastUpdateLocal;
};
const updateLastDateLocallyOnly = (game, resources) => {
    if (!game || !resources.length)
        return;
    console.log('UPDATING LAST DATE LOCALLY ONLY OF', game, resources);
    updateLastDateLocally(game, resources.map(resource => ({ resource, status: new Date().toISOString() })), true);
};
exports.updateLastDateLocallyOnly = updateLastDateLocallyOnly;
const getSize = (resource) => {
    return Buffer.byteLength(JSON.stringify(resource), 'utf8');
};
exports.getSize = getSize;
const verifyCloudSpace = async () => {
    const license = __1.customer.customer?.license.type;
    if (!license)
        return false;
    if (!(0, utils_1.canUserUseCloudStorage)(__1.customer)) {
        return false;
    }
    const spaceUsed = (0, middlewares_2.getAmountOfBytesOfDatabases)();
    return spaceLimit[license] > spaceUsed;
};
const addResource = async (game, resource, data, replaceCurrentCloud = false) => {
    const io = await socket_1.ioPromise;
    const cfg = await (0, config_1.loadConfig)();
    let url = `storage/${resource}/${game}`;
    if (replaceCurrentCloud) {
        url = `storage/${resource}/${game}?&replace=force`;
    }
    if (__1.customer.customer && __1.customer.workspace) {
        if (url.includes('?'))
            url += `&teamId=${__1.customer.workspace.id}`;
        else
            url += `?&teamId=${__1.customer.workspace.id}`;
    }
    const result = (await (0, user_1.api)(url, 'POST', data));
    if (!result) {
        cloudErrorHandler();
        return null;
    }
    if (!verifyCloudSpace()) {
        await (0, config_1.setConfig)({ ...cfg, sync: false });
    }
    io.emit('config');
    updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
    return result;
};
exports.addResource = addResource;
const updateResource = async (game, resource, data) => {
    const io = await socket_1.ioPromise;
    const cfg = await (0, config_1.loadConfig)();
    const status = await (0, exports.checkCloudStatus)(game);
    if (status !== 'ALL_SYNCED') {
        return;
    }
    let url = `storage/${resource}/${game}`;
    if (__1.customer.customer && __1.customer.workspace) {
        url += `?&teamId=${__1.customer.workspace.id}`;
    }
    const result = (await (0, user_1.api)(url, 'PATCH', data));
    if (!result) {
        cloudErrorHandler();
        return null;
    }
    if (!verifyCloudSpace()) {
        await (0, config_1.setConfig)({ ...cfg, sync: false });
    }
    io.emit('config');
    updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
    return result;
};
exports.updateResource = updateResource;
const deleteResource = async (game, resource, id) => {
    const status = await (0, exports.checkCloudStatus)(game);
    if (status !== 'ALL_SYNCED') {
        return;
    }
    const ids = typeof id === 'string' ? id : id.join(';');
    let url = `storage/${resource}/${game}/${ids}`;
    if (__1.customer.customer && __1.customer.workspace) {
        url += `?&teamId=${__1.customer.workspace.id}`;
    }
    const result = (await (0, user_1.api)(url, 'DELETE'));
    if (!result || !result.success) {
        cloudErrorHandler();
        return null;
    }
    updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
    return result;
};
exports.deleteResource = deleteResource;
const getResource = async (game, resource, fromDate) => {
    let url = `storage/${resource}/${game}`;
    if (__1.customer.customer && __1.customer.workspace) {
        url += `?&teamId=${__1.customer.workspace.id}`;
    }
    if (fromDate) {
        if (url.includes('?'))
            url += `&fromDate=${fromDate}`;
        else
            url += `?&fromDate=${fromDate}`;
    }
    const result = (await (0, user_1.api)(url));
    if (!result) {
        cloudErrorHandler();
        return null;
    }
    return result || null;
};
exports.getResource = getResource;
/**
 * If sync off (2.0+ was at least run once), do nothing.
 * Ask backend: Server will return EMPTY if no cloud data. Ask then if you want to upload current db
 * If data is on server, and no resources locally, syncing will be turned on and db downloaded
 * If there are resources locally, that were not synced, there will be options: upload local, download cloud, no sync
 * If data has the same time, do nothing
 * If local data is newer, ask which for option: upload local, download cloud, no sync
 * If local data is older, download cloud
 */
const downloadCloudData = async (game, resource, fromDate) => {
    const replacer = {};
    for (const resource of I.availableResources) {
        switch (resource) {
            case 'tournaments':
                replacer.tournaments = middlewares_1.replaceLocalTournaments;
                break;
            case 'matches':
                replacer.matches = matches_1.replaceLocalMatches;
                break;
            case 'customs':
                replacer.customs = fields_1.replaceLocalCustomFieldStores;
                break;
            case 'teams':
                replacer.teams = teams_1.replaceLocalTeams;
                break;
            case 'players':
                replacer.players = players_1.replaceLocalPlayers;
                break;
            case 'mapconfigs':
                replacer.mapconfigs = aco_1.replaceLocalMapConfigs;
                break;
        }
    }
    try {
        const resources = await (0, exports.getResource)(game, resource, fromDate);
        if (!resources) {
            return false;
        }
        console.log('reloading', resource, 'for', game);
        await replacer[resource](resources.resources.map(resource => ({ ...resource, game })), game, resources.existing);
        return true;
    }
    catch (e) {
        Sentry.captureException(e);
        return false;
    }
};
const downloadCloudToLocal = async (game) => {
    try {
        let url = `storage/${game}/status`;
        if (__1.customer.customer && __1.customer.workspace) {
            url += `?&teamId=${__1.customer.workspace.id}`;
        }
        const result = (await (0, user_1.api)(url));
        await Promise.all(I.availableResources.map(resource => downloadCloudData(game, resource)));
        updateLastDateLocally(game, result, true);
        return true;
    }
    catch (e) {
        Sentry.captureException(e);
        return false;
    }
};
exports.downloadCloudToLocal = downloadCloudToLocal;
const uploadLocalToCloud = async (game, replaceCurrentCloud = false) => {
    const resources = await getResources(game);
    const mappedResources = {
        players: resources[0],
        teams: resources[1],
        customs: resources[2],
        mapconfigs: resources[3],
        matches: resources[4],
        tournaments: resources[5]
    };
    try {
        const result = [];
        for (const resource of I.availableResources) {
            const response = await (0, exports.addResource)(game, resource, mappedResources[resource], replaceCurrentCloud);
            if (!response)
                return false;
            result.push(response);
        }
        return result.every(response => response.lastUpdateTime);
    }
    catch (e) {
        Sentry.captureException(e);
        return false;
    }
};
exports.uploadLocalToCloud = uploadLocalToCloud;
const checkCloudStatus = async (game) => {
    console.log('CHECKING CLOUD...');
    if (!(0, utils_1.canUserUseCloudStorage)(__1.customer)) {
        return 'ALL_SYNCED';
    }
    const cfg = await (0, config_1.loadConfig)();
    if (cfg.sync === false)
        return 'ALL_SYNCED';
    if (!cfg.sync) {
        await (0, config_1.setConfig)({ ...cfg, sync: true });
    }
    try {
        let url = `storage/${game}/status`;
        if (__1.customer.customer && __1.customer.workspace) {
            url += `?&teamId=${__1.customer.workspace.id}`;
        }
        const result = (await (0, user_1.api)(url));
        if (!result) {
            return 'UNKNOWN_ERROR';
        }
        if (result.every(status => !status.status)) {
            // No remote resources
            // Ask if to upload current db - rejection will result in cloud option turned off
            console.log('NO REMOTE RESOURCES, UPLOAD?');
            return 'NO_UPLOADED_RESOURCES';
        }
        const lastUpdateStatusOnline = {};
        for (const resourceStatus of result) {
            lastUpdateStatusOnline[resourceStatus.resource] = resourceStatus.status;
        }
        const resources = await getResources(game);
        if (resources.every(resource => !resource.length)) {
            // no local resources
            // download db
            console.log('NO LOCAL RESOURCES, DOWNLOADING...');
            await Promise.all(I.availableResources.map(resource => downloadCloudData(game, resource)));
            updateLastDateLocally(game, result, true);
            return 'ALL_SYNCED';
        }
        const mappedResources = {
            players: resources[0],
            teams: resources[1],
            customs: resources[2],
            mapconfigs: resources[3],
            matches: resources[4],
            tournaments: resources[5]
        };
        const lastUpdateStatusLocal = getLastUpdateDateLocally();
        const syncConflicted = I.availableResources.filter(availableResource => !lastUpdateStatusLocal[game][availableResource] &&
            lastUpdateStatusOnline[availableResource] &&
            mappedResources[availableResource].length);
        if (syncConflicted.length) {
            // resources exist both locally and remotely, but local db wasnt ever synced
            // show options: download cloud, no sync
            console.log('SYNC CONFLICT, WHAT DO? #1', syncConflicted);
            return 'NO_SYNC_LOCAL';
        }
        const nonSyncedResources = I.availableResources.filter(availableResource => lastUpdateStatusOnline[availableResource] !== lastUpdateStatusLocal[game][availableResource]);
        if (!nonSyncedResources.length) {
            // All resources are supposed to be in sync here
            console.log('NICE. no reason to sync');
            return 'ALL_SYNCED';
        }
        if (nonSyncedResources.find(resource => !lastUpdateStatusOnline[resource] ||
            new Date(lastUpdateStatusLocal[game][resource]) >
                new Date(lastUpdateStatusOnline[resource]))) {
            // Local data found newer, show options
            console.log('SYNC CONFLICT, WHAT DO? #2');
            return 'NO_SYNC_LOCAL';
        }
        // Local data older, download non-synced resources
        await Promise.all(nonSyncedResources.map(resource => downloadCloudData(game, resource, lastUpdateStatusLocal[game][resource])));
        updateLastDateLocally(game, result.filter(resource => nonSyncedResources.includes(resource.resource)));
        return 'ALL_SYNCED';
    }
    catch (e) {
        console.log(e);
        Sentry.captureException(e);
        return 'UNKNOWN_ERROR';
    }
};
exports.checkCloudStatus = checkCloudStatus;
