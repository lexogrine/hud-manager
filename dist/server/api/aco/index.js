"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceLocalMapConfigs = exports.updateACO = exports.loadNewConfigs = exports.getACOs = exports.getACOByMapName = void 0;
const database_1 = require("./../../../init/database");
const areas_1 = __importDefault(require("../../aco/areas"));
const __1 = require("..");
const cloud_1 = require("../cloud");
async function getACOByMapName(mapName) {
    return new Promise(res => {
        if (!database_1.databaseContext.databases.aco)
            return res(null);
        database_1.databaseContext.databases.aco.findOne({ map: mapName }, (err, acoConfig) => {
            if (err) {
                return res(null);
            }
            if (!acoConfig) {
                return res(null);
            }
            if (!__1.customer.customer || __1.customer.customer.license.type === 'free') {
                return res(null);
            }
            if (__1.customer.customer.license.type === 'personal') {
                return res({ ...acoConfig, areas: acoConfig.areas.slice(0, 4) });
            }
            return res(acoConfig);
        });
    });
}
exports.getACOByMapName = getACOByMapName;
const getACOs = () => new Promise(res => {
    if (!database_1.databaseContext.databases.aco)
        return res([]);
    database_1.databaseContext.databases.aco.find({}, (err, acoConfigs) => {
        if (err) {
            return res([]);
        }
        return res(acoConfigs);
    });
});
exports.getACOs = getACOs;
const loadNewConfigs = () => {
    (0, exports.getACOs)().then(acos => {
        areas_1.default.areas = acos;
    });
};
exports.loadNewConfigs = loadNewConfigs;
const updateACO = (config) => new Promise(res => {
    if (!database_1.databaseContext.databases.aco)
        return res(null);
    getACOByMapName(config.map).then(async (oldConfig) => {
        let cloudStatus = false;
        if (await (0, __1.validateCloudAbility)()) {
            cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
        }
        if (!oldConfig) {
            database_1.databaseContext.databases.aco.insert(config, async (err, newConfig) => {
                if (err) {
                    return res(null);
                }
                if (cloudStatus) {
                    await (0, cloud_1.addResource)(__1.customer.game, 'mapconfigs', newConfig);
                }
                else {
                    (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['mapconfigs']);
                }
                return res(newConfig);
            });
        }
        else {
            if (!('_id' in config)) {
                return res(null);
            }
            database_1.databaseContext.databases.aco.update({ _id: config._id }, config, {}, async (err, n) => {
                if (err) {
                    return res(null);
                }
                (0, exports.loadNewConfigs)();
                if (cloudStatus) {
                    await (0, cloud_1.updateResource)(__1.customer.game, 'mapconfigs', {
                        ...config,
                        _id: config._id
                    });
                }
                else {
                    (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['mapconfigs']);
                }
                return res(config);
            });
        }
    });
});
exports.updateACO = updateACO;
const replaceLocalMapConfigs = (newMapConfigs, game, existing) => new Promise(res => {
    if (!database_1.databaseContext.databases.aco)
        return res(false);
    const or = [
        { game, _id: { $nin: existing } },
        { game, _id: { $in: newMapConfigs.map(mapConfig => mapConfig._id) } }
    ];
    if (game === 'csgo') {
        or.push({ game: { $exists: false }, _id: { $nin: existing } }, { game: { $exists: false }, _id: { $in: newMapConfigs.map(mapConfig => mapConfig._id) } });
    }
    database_1.databaseContext.databases.aco.remove({ $or: or }, { multi: true }, err => {
        if (err) {
            return res(false);
        }
        database_1.databaseContext.databases.aco.insert(newMapConfigs, (err, docs) => {
            (0, exports.loadNewConfigs)();
            return res(!err);
        });
    });
});
exports.replaceLocalMapConfigs = replaceLocalMapConfigs;
(0, exports.loadNewConfigs)();
