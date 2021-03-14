"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayersList = exports.getPlayerBySteamId = exports.getPlayerById = void 0;
const database_1 = __importDefault(require("./../../../init/database"));
const { players } = database_1.default;
async function getPlayerById(id, avatar = false) {
    return new Promise(res => {
        players.findOne({ _id: id }, (err, player) => {
            if (err) {
                return res(null);
            }
            if (!avatar && player && player.avatar)
                player.avatar = '';
            return res(player);
        });
    });
}
exports.getPlayerById = getPlayerById;
async function getPlayerBySteamId(steamid, avatar = false) {
    return new Promise(res => {
        players.findOne({ steamid }, (err, player) => {
            if (err) {
                return res(null);
            }
            if (!avatar && player && player.avatar)
                player.avatar = '';
            return res(player);
        });
    });
}
exports.getPlayerBySteamId = getPlayerBySteamId;
exports.getPlayersList = (query) => new Promise(res => {
    players.find(query, (err, players) => {
        if (err) {
            return res([]);
        }
        return res([...players].sort((a, b) => a.username > b.username ? 1 : -1));
    });
});
