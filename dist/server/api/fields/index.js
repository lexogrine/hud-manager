"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFields = exports.getFields = exports.getCustomFieldsDb = exports.replaceLocalCustomFieldStores = exports.initiateCustomFields = void 0;
const database_1 = __importDefault(require("./../../../init/database"));
const __1 = require("..");
const cloud_1 = require("../cloud");
const { custom } = database_1.default;
exports.initiateCustomFields = (game = 'csgo', dontCreateOnCall = false) => new Promise(res => {
    const or = [{ game }];
    if (game === 'csgo') {
        or.push({ game: { $exists: false } });
    }
    custom.findOne({ $or: or }, (err, store) => {
        if (store) {
            return res(store);
        }
        if (dontCreateOnCall) {
            return res(null);
        }
        const customFields = { players: [], teams: [], game };
        custom.insert(customFields, (err, entry) => {
            return res(entry);
        });
    });
});
exports.replaceLocalCustomFieldStores = (stores, game, existing) => new Promise(res => {
    const or = [
        { game, _id: { $nin: existing } },
        { game, _id: { $in: stores.map(store => store._id) } }
    ];
    if (game === 'csgo') {
        or.push({ game: { $exists: false }, _id: { $nin: existing } }, { game: { $exists: false }, _id: { $in: stores.map(store => store._id) } });
    }
    custom.remove({ $or: or }, { multi: true }, err => {
        if (err) {
            return res(false);
        }
        custom.insert(stores, (err, docs) => {
            return res(!err);
        });
    });
});
exports.getCustomFieldsDb = async (game) => {
    const customFields = await exports.initiateCustomFields(game, true);
    if (!customFields)
        return [];
    return [customFields];
};
exports.getFields = async (type, game) => {
    const store = await exports.initiateCustomFields(game, true);
    if (!store)
        return [];
    return store[type];
};
exports.updateFields = async (fields, type, game) => {
    const store = await exports.initiateCustomFields(game);
    const deletedFields = store[type].filter(field => !fields.find(newField => newField.name === field.name));
    const createdFields = fields.filter(newField => !store[type].find(field => field.name === newField.name));
    let cloudStatus = false;
    if (__1.validateCloudAbility()) {
        cloudStatus = (await cloud_1.checkCloudStatus(__1.customer.game)) === 'ALL_SYNCED';
    }
    return new Promise(res => {
        custom.update({}, { $set: { [type]: fields } }, { multi: true }, async () => {
            if (!deletedFields.length && !createdFields.length) {
                return res(await exports.initiateCustomFields(game));
            }
            const updateQuery = {
                $unset: {},
                $set: {}
            };
            for (const deletedField of deletedFields) {
                updateQuery.$unset[`extra.${deletedField.name}`] = true;
            }
            for (const createdField of createdFields) {
                updateQuery.$set[`extra.${createdField.name}`] = '';
            }
            database_1.default[type].update({}, updateQuery, { multi: true }, async () => {
                const result = await exports.initiateCustomFields(game);
                if (cloudStatus) {
                    await cloud_1.updateResource(__1.customer.game, 'customs', result);
                }
                res(result);
            });
        });
    });
};
