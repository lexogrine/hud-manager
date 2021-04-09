"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResource = exports.addResource = exports.verifyCloudSync = void 0;
const user_1 = require("./../user");
const cloudErrorHandler = () => {
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
exports.verifyCloudSync = () => {
};
exports.addResource = async (game, resource, data) => {
    const result = await user_1.api(`storage/${resource}/${game}`, 'POST', data);
    if (!result) {
        cloudErrorHandler();
        return null;
    }
    return result;
};
exports.getResource = async (game, resource) => {
    const result = await user_1.api(`storage/${resource}/${game}`);
    if (!result) {
        cloudErrorHandler();
        return null;
    }
    return result || null;
};
