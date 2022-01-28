"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFields = exports.getFields = exports.getCustomFieldsDb = exports.replaceLocalCustomFieldStores = exports.initiateCustomFields = void 0;
const database_1 = require("./../../../init/database");
const __1 = require("..");
const cloud_1 = require("../cloud");
const initiateCustomFields = (game = 'csgo', dontCreateOnCall = false) => new Promise(res => {
    if (!database_1.databaseContext.databases.custom)
        return res(null);
    const or = [{ game }];
    if (game === 'csgo') {
        or.push({ game: { $exists: false } });
    }
    database_1.databaseContext.databases.custom.findOne({ $or: or }, (err, store) => {
        if (store) {
            return res(store);
        }
        if (dontCreateOnCall) {
            return res(null);
        }
        const customFields = { players: [], teams: [], game };
        database_1.databaseContext.databases.custom.insert(customFields, (err, entry) => {
            return res(entry);
        });
    });
});
exports.initiateCustomFields = initiateCustomFields;
const replaceLocalCustomFieldStores = (stores, game, existing) => new Promise(res => {
    if (!database_1.databaseContext.databases.custom)
        return res(false);
    const or = [
        { game, _id: { $nin: existing } },
        { game, _id: { $in: stores.map(store => store._id) } }
    ];
    if (game === 'csgo') {
        or.push({ game: { $exists: false }, _id: { $nin: existing } }, { game: { $exists: false }, _id: { $in: stores.map(store => store._id) } });
    }
    database_1.databaseContext.databases.custom.remove({ $or: or }, { multi: true }, err => {
        if (err) {
            return res(false);
        }
        database_1.databaseContext.databases.custom.insert(stores, (err, docs) => {
            return res(!err);
        });
    });
});
exports.replaceLocalCustomFieldStores = replaceLocalCustomFieldStores;
const getCustomFieldsDb = async (game) => {
    const customFields = await (0, exports.initiateCustomFields)(game, true);
    if (!customFields)
        return [];
    return [customFields];
};
exports.getCustomFieldsDb = getCustomFieldsDb;
const getFields = async (type, game) => {
    const store = await (0, exports.initiateCustomFields)(game, true);
    if (!store)
        return [];
    return store[type];
};
exports.getFields = getFields;
const updateFields = async (fields, type, game) => {
    if (!database_1.databaseContext.databases.custom)
        return { teams: [], players: [] };
    const store = await (0, exports.initiateCustomFields)(game);
    const deletedFields = store[type].filter(field => !fields.find(newField => newField.name === field.name));
    const createdFields = fields.filter(newField => !store[type].find(field => field.name === newField.name));
    let cloudStatus = false;
    if (await (0, __1.validateCloudAbility)()) {
        cloudStatus = (await (0, cloud_1.checkCloudStatus)(__1.customer.game)) === 'ALL_SYNCED';
    }
    return new Promise(res => {
        database_1.databaseContext.databases.custom.update({}, { $set: { [type]: fields } }, { multi: true }, async () => {
            if (!deletedFields.length && !createdFields.length) {
                return res(await (0, exports.initiateCustomFields)(game));
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
            database_1.databaseContext.databases[type].update({}, updateQuery, { multi: true }, async () => {
                const result = await (0, exports.initiateCustomFields)(game);
                if (cloudStatus) {
                    await (0, cloud_1.updateResource)(__1.customer.game, 'customs', result);
                }
                else {
                    (0, cloud_1.updateLastDateLocallyOnly)(__1.customer.game, ['customs']);
                }
                res(result);
            });
        });
    });
};
exports.updateFields = updateFields;
