"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCloudStatus = exports.getResource = exports.deleteResource = exports.updateResource = exports.addResource = void 0;
const user_1 = require("./../user");
const I = __importStar(require("../../../types/interfaces"));
const config_1 = require("../config");
const players_1 = require("../players");
const teams_1 = require("../teams");
const matches_1 = require("../matches");
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const cloudErrorHandler = () => { };
const getLastUpdateDateLocally = () => {
    const userData = electron_1.app.getPath('userData');
    const database = path_1.default.join(userData, 'databases', 'lastUpdated.lhm');
    let lastUpdated = {};
    let saveOnFinish = true;
    try {
        if (fs_1.default.existsSync(database)) {
            saveOnFinish = false;
            lastUpdated = JSON.parse(fs_1.default.readFileSync(database, 'utf8'));
        }
        for (const game of I.availableGames) {
            for (const resource of I.availableResources) {
                if (!lastUpdated[game]) {
                    lastUpdated[game] = {};
                }
                if (!lastUpdated[game][resource])
                    lastUpdated[game][resource] = (new Date(0)).toISOString();
            }
        }
        if (saveOnFinish) {
            fs_1.default.writeFileSync(database, JSON.stringify(lastUpdated), 'utf8');
        }
        return lastUpdated;
    }
    catch {
        for (const game of I.availableGames) {
            for (const resource of I.availableResources) {
                if (!lastUpdated[game]) {
                    lastUpdated[game] = {};
                }
                if (!lastUpdated[game][resource])
                    lastUpdated[game][resource] = (new Date(0)).toISOString();
            }
        }
        return lastUpdated;
    }
};
const updateLastDateLocally = (game, resources) => {
    const lastUpdateLocal = getLastUpdateDateLocally();
    for (const resourceInfo of resources) {
        lastUpdateLocal[game][resourceInfo.resource] = resourceInfo.status || (new Date(0)).toISOString();
    }
    const userData = electron_1.app.getPath('userData');
    const database = path_1.default.join(userData, 'databases', 'lastUpdated.lhm');
    fs_1.default.writeFileSync(database, JSON.stringify(lastUpdateLocal), 'utf8');
    return lastUpdateLocal;
};
exports.addResource = async (game, resource, data) => {
    const result = (await user_1.api(`storage/${resource}/${game}`, 'POST', data));
    if (!result) {
        cloudErrorHandler();
        return null;
    }
    updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
    return result;
};
exports.updateResource = async (game, resource, data) => {
    const result = (await user_1.api(`storage/${resource}/${game}`, 'PATCH', data));
    if (!result) {
        cloudErrorHandler();
        return null;
    }
    updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
    return result;
};
exports.deleteResource = async (game, resource, id) => {
    const result = (await user_1.api(`storage/${resource}/${game}/${id}`, 'DELETE'));
    if (!result || !result.success) {
        cloudErrorHandler();
        return null;
    }
    updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
    return result;
};
exports.getResource = async (game, resource) => {
    const result = (await user_1.api(`storage/${resource}/${game}`));
    if (!result) {
        cloudErrorHandler();
        return null;
    }
    return result || null;
};
/**
 *
 * return sdf
 */
/**
 * If sync off (2.0+ was at least run once), do nothing.
 * Ask backend: Server will return EMPTY if no cloud data. Ask then if you want to upload current db
 * If data is on server, and no resources locally, syncing will be turned on and db downloaded
 * If there are resources locally, that were not synced, there will be options: upload local, download cloud, no sync
 * If data has the same time, do nothing
 * If local data is newer, ask which for option: upload local, download cloud, no sync
 * If local data is older, download cloud
 */
const updateCloudToLocal = async (game, resource) => {
    const replacer = {};
    for (const resource of I.availableResources) {
        switch (resource) {
            case "matches":
                replacer.matches = matches_1.replaceLocalMatches;
                break;
            case "teams":
                replacer.teams = teams_1.replaceLocalTeams;
                break;
            case "players":
                replacer.players = players_1.replaceLocalPlayers;
                break;
        }
    }
    try {
        const resources = await exports.getResource(game, resource);
        if (!resources) {
            return false;
        }
        console.log("reloading", resource, 'for', game);
        await replacer[resource](resources, game);
        return true;
    }
    catch {
        return false;
    }
};
exports.checkCloudStatus = async (game) => {
    if (__1.customer.customer?.license.type !== "professional" && __1.customer.customer?.license.type !== "enterprise") {
        return "ALL_SYNCED";
    }
    const cfg = await config_1.loadConfig();
    if (cfg.sync === false)
        return;
    if (!cfg.sync) {
        await config_1.setConfig({ ...cfg, sync: true });
    }
    try {
        const result = await user_1.api(`storage/${game}/status`);
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
        const resources = await Promise.all([players_1.getPlayersList({}), teams_1.getTeamsList({}), matches_1.getMatches()]);
        if (resources.every(resource => !resource.length)) {
            // no local resources
            // download db
            console.log('NO LOCAL RESOURCES, DOWNLOADING...');
            await Promise.all(I.availableResources.map(resource => updateCloudToLocal(game, resource)));
            updateLastDateLocally(game, result);
            return 'ALL_SYNCED';
        }
        const lastUpdateStatusLocal = getLastUpdateDateLocally();
        if (I.availableResources.find(availableResource => !lastUpdateStatusLocal[game][availableResource])) {
            // resources exist both locally and remotely, but local db wasnt ever synced
            // show options: upload local, download cloud, no sync
            console.log(lastUpdateStatusLocal);
            console.log(I.availableResources.filter(availableResource => !lastUpdateStatusLocal[game][availableResource]));
            console.log('SYNC CONFLICT, WHAT DO? #1');
            return 'NO_SYNC_LOCAL';
        }
        const nonSyncedResources = I.availableResources.filter(availableResource => lastUpdateStatusOnline[availableResource] !== lastUpdateStatusLocal[game][availableResource]);
        if (!nonSyncedResources.length) {
            // All resources are supposed to be in sync here
            console.log('NICE. no reason to sync');
            return 'ALL_SYNCED';
        }
        if (nonSyncedResources.find(resource => !lastUpdateStatusOnline[resource] || new Date(lastUpdateStatusLocal[game][resource]) > new Date(lastUpdateStatusOnline[resource]))) {
            // Local data found newer, show options
            console.log('SYNC CONFLICT, WHAT DO? #2');
            return 'NO_SYNC_LOCAL';
        }
        // Local data older, download non-synced resources
        await Promise.all(nonSyncedResources.map(resource => updateCloudToLocal(game, resource)));
        updateLastDateLocally(game, result.filter(resource => nonSyncedResources.includes(resource.resource)));
        console.log('NICE');
        return 'ALL_SYNCED';
    }
    catch (e) {
        console.log(e);
        return 'UNKNOWN_ERROR';
    }
};
