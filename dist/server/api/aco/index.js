"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateACO = exports.getACOs = exports.getACOByMapName = void 0;
const database_1 = __importDefault(require("./../../../init/database"));
const areas_1 = __importDefault(require("../../aco/areas"));
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
exports.getACOs = () => new Promise(res => {
    aco.find({}, (err, acoConfigs) => {
        if (err) {
            return res([]);
        }
        return res(acoConfigs);
    });
});
exports.updateACO = (config) => new Promise(res => {
    getACOByMapName(config.map).then(oldConfig => {
        if (!oldConfig) {
            aco.insert(config, (err, newConfig) => {
                if (err) {
                    return res(null);
                }
                return res(newConfig);
            });
        }
        else {
            aco.update({ map: config.map }, config, {}, (err, n) => {
                if (err) {
                    return res(null);
                }
                exports.getACOs().then(acos => {
                    areas_1.default.areas = acos;
                });
                return res(config);
            });
        }
    });
});
/*
export const replaceLocalTeams = (newTeams: Team[], game: AvailableGames, existing: string[]) =>
    new Promise<boolean>(res => {
        const or: any[] = [
            { game, _id: { $nin: existing } },
            { game, _id: { $in: newTeams.map(team => team._id) } }
        ];
        if (game === 'csgo') {
            or.push(
                { game: { $exists: false }, _id: { $nin: existing } },
                { game: { $exists: false }, _id: { $in: newTeams.map(team => team._id) } }
            );
        }
        teams.remove({ $or: or }, { multi: true }, err => {
            if (err) {
                return res(false);
            }
            teams.insert(newTeams, (err, docs) => {
                return res(!err);
            });
        });
    });
*/
