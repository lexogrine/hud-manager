"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceLocalMapConfigs = exports.updateACO = exports.loadNewConfigs = exports.getACOs = exports.getACOByMapName = void 0;
const database_1 = __importDefault(require("./../../../init/database"));
const areas_1 = __importDefault(require("../../aco/areas"));
const __1 = require("..");
const cloud_1 = require("../cloud");
const { aco } = database_1.default;
async function getACOByMapName(mapName) {
    return new Promise(res => {
        aco.findOne({ map: mapName }, (err, acoConfig) => {
            if (err) {
                return res(null);
            }
            return res(acoConfig);
        });
    });
}
exports.getACOByMapName = getACOByMapName;
const getACOs = () => new Promise(res => {
    aco.find({}, (err, acoConfigs) => {
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
    getACOByMapName(config.map).then(async (oldConfig) => {
        let cloudStatus = false;
        if (await (0, __1.validateCloudAbility)()) {
            cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
        }
        if (!oldConfig) {
            aco.insert(config, async (err, newConfig) => {
                if (err) {
                    return res(null);
                }
                if (cloudStatus) {
                    await (0, cloud_1.addResource)(__1.customer.game, 'mapconfigs', newConfig);
                }
                return res(newConfig);
            });
        }
        else {
            if (!('_id' in config)) {
                return res(null);
            }
            aco.update({ _id: config._id }, config, {}, async (err, n) => {
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
                return res(config);
            });
        }
    });
});
exports.updateACO = updateACO;
const replaceLocalMapConfigs = (newMapConfigs, game, existing) => new Promise(res => {
    const or = [
        { game, _id: { $nin: existing } },
        { game, _id: { $in: newMapConfigs.map(mapConfig => mapConfig._id) } }
    ];
    if (game === 'csgo') {
        or.push({ game: { $exists: false }, _id: { $nin: existing } }, { game: { $exists: false }, _id: { $in: newMapConfigs.map(mapConfig => mapConfig._id) } });
    }
    aco.remove({ $or: or }, { multi: true }, err => {
        if (err) {
            return res(false);
        }
        aco.insert(newMapConfigs, (err, docs) => {
            (0, exports.loadNewConfigs)();
            return res(!err);
        });
    });
});
exports.replaceLocalMapConfigs = replaceLocalMapConfigs;
(0, exports.loadNewConfigs)();
