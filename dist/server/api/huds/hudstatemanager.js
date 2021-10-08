"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HUDStateManager = void 0;
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const teams_1 = require("../teams");
const players_1 = require("../players");
const matches_1 = require("../matches");
class HUDStateManager {
    data;
    devHUD;
    constructor() {
        this.data = new Map();
        this.devHUD = null;
    }
    async save(hud, data) {
        const hudPath = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', hud);
        if (!fs_1.default.existsSync(hudPath))
            return;
        fs_1.default.writeFileSync(path_1.default.join(hudPath, 'config.hm'), JSON.stringify(data));
    }
    set(hud, section, data) {
        const form = this.get(hud);
        const newForm = { ...form, [section]: data };
        this.save(hud, newForm);
        this.data.set(hud, newForm);
    }
    get(hud, force = false) {
        const hudData = this.data.get(hud);
        const hudPath = path_1.default.join(electron_1.app.getPath('home'), 'HUDs', hud);
        const hudConfig = path_1.default.join(hudPath, 'config.hm');
        if (hudData || !force || !fs_1.default.existsSync(hudPath) || !fs_1.default.existsSync(hudConfig))
            return hudData;
        const rawData = fs_1.default.readFileSync(hudConfig, 'utf8');
        try {
            const data = JSON.parse(rawData);
            return this.data.set(hud, data).get(hud);
        }
        catch {
            return undefined;
        }
    }
    static extend = async (hudData) => {
        if (!hudData || typeof hudData !== 'object')
            return hudData;
        for (const data of Object.values(hudData)) {
            if (!data || typeof data !== 'object')
                return hudData;
            const entries = Object.values(data);
            for (const entry of entries) {
                if (!entry || typeof entry !== 'object')
                    continue;
                if (!('type' in entry) || !('id' in entry))
                    continue;
                let extraData;
                switch (entry.type) {
                    case 'match':
                        extraData = await (0, matches_1.getMatchById)(entry.id);
                        break;
                    case 'player':
                        extraData = await (0, players_1.getPlayerById)(entry.id);
                        break;
                    case 'team':
                        extraData = await (0, teams_1.getTeamById)(entry.id);
                        break;
                    default:
                        continue;
                }
                entry[entry.type] = extraData;
            }
        }
        return hudData;
    };
}
exports.HUDStateManager = HUDStateManager;
