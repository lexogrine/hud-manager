"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFields = exports.getFields = exports.initiateCustomFields = void 0;
const database_1 = __importDefault(require("./../../../init/database"));
const { custom } = database_1.default;
exports.initiateCustomFields = () => new Promise(res => {
    custom.findOne({}, (err, store) => {
        if (store) {
            return res(store);
        }
        const customFields = { players: [], teams: [] };
        custom.insert(customFields, (err, entry) => {
            return res(entry);
        });
    });
});
exports.getFields = async (type) => {
    const store = await exports.initiateCustomFields();
    if (!store)
        return [];
    return store[type];
};
exports.updateFields = async (fields, type) => {
    const store = await exports.initiateCustomFields();
    const deletedFields = store[type].filter(field => !fields.find(newField => newField.name === field.name));
    const createdFields = fields.filter(newField => !store[type].find(field => field.name === newField.name));
    return new Promise(res => {
        custom.update({}, { $set: { [type]: fields } }, { multi: true }, async () => {
            if (!deletedFields.length && !createdFields.length) {
                return res(await exports.initiateCustomFields());
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
                res(await exports.initiateCustomFields());
            });
        });
    });
};
