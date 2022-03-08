"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAppUsage = exports.resetAppUsage = exports.getAppUsage = exports.increaseAppUsage = void 0;
const user_1 = require("./user");
const emptyStorePortion = {
    huds: 0,
    teams: 0,
    players: 0,
    matches: 0,
    tournaments: 0,
    cgmode: 0,
    aco: 0,
    arg: 0,
    ar: 0,
    live: 0,
    cameras: 0,
    settings: 0
};
const appUsageStore = {
    csgo: { ...emptyStorePortion },
    dota2: { ...emptyStorePortion },
    f1: { ...emptyStorePortion },
    rocketleague: { ...emptyStorePortion }
};
const increaseAppUsage = (req, res) => {
    if (!req.body.game ||
        !(req.body.game in appUsageStore) ||
        !req.body.type ||
        !(req.body.type in appUsageStore[req.body.game])) {
        console.log('increaseAppUsage failed because type is not valid');
        return res.status(400).json({ success: false, error: 'Invalid usage type' });
    }
    appUsageStore[req.body.game][req.body.type]++;
    console.log('increaseAppUsage, store is now', appUsageStore);
    return res.json({ success: true });
};
exports.increaseAppUsage = increaseAppUsage;
const getAppUsage = (req, res) => {
    return res.json({ data: appUsageStore });
};
exports.getAppUsage = getAppUsage;
const resetAppUsage = (req, res) => {
    appUsageStore.csgo = { ...emptyStorePortion };
    appUsageStore.dota2 = { ...emptyStorePortion };
    appUsageStore.f1 = { ...emptyStorePortion };
    appUsageStore.rocketleague = { ...emptyStorePortion };
    return res.json({ success: true });
};
exports.resetAppUsage = resetAppUsage;
const uploadAppUsage = async () => {
    try {
        const data = Object.keys(appUsageStore)
            .map(game => Object.keys(appUsageStore[game]).map(type => ({
            type,
            game,
            count: appUsageStore[game][type]
        })))
            .flat()
            .filter(item => item.count > 0);
        console.log('pre uploadAppUsage, data is', data);
        const result = await (0, user_1.api)('usage', 'POST', { data });
        console.log('uploadAppUsage', result);
        return result;
    }
    catch (e) {
        console.error('Error while sending usage statistics:', e);
        return false;
    }
};
exports.uploadAppUsage = uploadAppUsage;
