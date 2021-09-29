"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dota2TimelineHandler = exports.timeline = void 0;
const attributes = ["gold", "gold_reliable", "gold_unreliable", "kills", "deaths", "assists", "last_hits", "denies", "gold_from_hero_kills", "gold_from_creep_kills", "gold_from_income", "gold_from_shared", "gpm", "xpm", "net_worth", "hero_damage", "wards_purchased", "wards_destroyed", "wards_placed", "runes_activated", "camps_stacked", "support_gold_spent", "consumable_gold_spent", "item_gold_spent", "gold_lost_to_death", "gold_spent_on_buybacks"];
exports.timeline = { data: [], lastGameTime: 0 };
const getOldValue = (oldEntry, attribute) => {
    if (!oldEntry)
        return 0;
    return oldEntry[attribute];
};
const getPlayerDelta = (player, oldEntry) => {
    const entry = {
        steamid: player.steamid,
        id: player.id
    };
    for (const attribute of attributes) {
        entry[attribute] = player[attribute] - getOldValue(oldEntry, attribute);
    }
    return entry;
};
let lastInnerDataSave = new Date().getTime();
const dota2TimelineHandler = (Dota2GSI) => {
    Dota2GSI.on("data", dota2 => {
        if (new Date().getTime() - lastInnerDataSave <= 5 * 60 * 1000) {
            return;
        }
        lastInnerDataSave = new Date().getTime();
        if (dota2.map.game_time < exports.timeline.lastGameTime) {
            exports.timeline.data = [];
        }
        const lastTimelineEntry = exports.timeline.data[exports.timeline.data.length - 1];
        const newEntry = {
            players: [],
            gameTime: dota2.map.game_time,
        };
        if (!lastTimelineEntry) {
            for (const player of dota2.players) {
                newEntry.players.push(getPlayerDelta(player, null));
            }
            exports.timeline.data.push(newEntry);
            exports.timeline.lastGameTime = dota2.map.game_time;
            return;
        }
        for (const player of dota2.players) {
            const oldPlayerEntry = lastTimelineEntry.players.find(oldPlayer => oldPlayer.steamid === player.steamid);
            newEntry.players.push(getPlayerDelta(player, oldPlayerEntry || null));
        }
        exports.timeline.data.push(newEntry);
        exports.timeline.lastGameTime = dota2.map.game_time;
        return;
    });
};
exports.dota2TimelineHandler = dota2TimelineHandler;
