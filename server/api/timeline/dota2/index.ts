import { DOTA2GSI, Player } from "dotagsi"


type PlayerTimelineInfo = {
	steamid: string;
	id: number;
	gold: number;
	gold_reliable: number;
	gold_unreliable: number;
	kills: number;
	deaths: number;
	assists: number;
	last_hits: number;
	denies: number;
	gold_from_hero_kills: number;
	gold_from_creep_kills: number;
	gold_from_income: number;
	gold_from_shared: number;
    gpm: number,
    xpm: number,
    net_worth: number,
    hero_damage: number,
    wards_purchased: number,
    wards_destroyed: number,
    wards_placed: number,
    runes_activated: number,
	camps_stacked: number;
	support_gold_spent: number;
	consumable_gold_spent: number;
	item_gold_spent: number;
	gold_lost_to_death: number;
	gold_spent_on_buybacks: number;
}

type PlayerTimelineAttributes = keyof Omit<Omit<PlayerTimelineInfo, "id">, "steamid">

const attributes: PlayerTimelineAttributes[] = ["gold","gold_reliable","gold_unreliable","kills","deaths","assists","last_hits","denies","gold_from_hero_kills","gold_from_creep_kills","gold_from_income","gold_from_shared","gpm","xpm","net_worth","hero_damage","wards_purchased","wards_destroyed","wards_placed","runes_activated","camps_stacked","support_gold_spent","consumable_gold_spent","item_gold_spent","gold_lost_to_death","gold_spent_on_buybacks"]

type TimelineEntry = {
    players: PlayerTimelineInfo[],
    gameTime: number
}

type Timeline = {
    data: TimelineEntry[],
    lastGameTime: number
}

export const timeline: Timeline = { data: [], lastGameTime: 0 }

const getOldValue = (oldEntry: PlayerTimelineInfo | null, attribute: PlayerTimelineAttributes) => {
    if(!oldEntry) return 0;
    return oldEntry[attribute];
}

const getPlayerDelta = (player: Player, oldEntry: PlayerTimelineInfo | null) => {
    const entry = {
        steamid: player.steamid,
        id: player.id
    } as PlayerTimelineInfo;
    for(const attribute of attributes){
        entry[attribute] = player[attribute] - getOldValue(oldEntry, attribute)
    }
    return entry;
}

let lastInnerDataSave = new Date().getTime();

export const dota2TimelineHandler = (Dota2GSI: DOTA2GSI) => {
    Dota2GSI.on("data", dota2 => {
        if(new Date().getTime() - lastInnerDataSave <= 5*60*1000){
            return;
        }

        lastInnerDataSave = new Date().getTime();
        if(dota2.map.game_time < timeline.lastGameTime){
            timeline.data = [];
        }

        const lastTimelineEntry = timeline.data[timeline.data.length - 1];

        const newEntry: TimelineEntry = {
            players: [],
            gameTime: dota2.map.game_time,
        }

        if(!lastTimelineEntry){
            for(const player of dota2.players){
                newEntry.players.push(getPlayerDelta(player, null));
            }

            timeline.data.push(newEntry);
            timeline.lastGameTime = dota2.map.game_time;
            return;
        }

        
        for(const player of dota2.players){
            const oldPlayerEntry = lastTimelineEntry.players.find(oldPlayer => oldPlayer.steamid === player.steamid);
            newEntry.players.push(getPlayerDelta(player, oldPlayerEntry || null));
        }

        timeline.data.push(newEntry);
        timeline.lastGameTime = dota2.map.game_time;
        return;
    });
}