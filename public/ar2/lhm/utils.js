/* eslint-disable no-undef */
const parsePlayer = (basePlayer, steamid, team, extensions) => {
    const extension = extensions.find(player => player.steamid === steamid);
    const player = {
        steamid,
        name: (extension && extension.name) || basePlayer.name,
        observer_slot: basePlayer.observer_slot,
        stats: basePlayer.match_stats,
        weapons: basePlayer.weapons,
        state: { ...basePlayer.state, smoked: basePlayer.state.smoked || 0 },
        position: basePlayer.position.split(', ').map(pos => Number(pos)),
        forward: basePlayer.forward.split(', ').map(pos => Number(pos)),
        team,
        avatar: (extension && extension.avatar) || null,
        country: (extension && extension.country) || null,
        realName: (extension && extension.realName) || null,
        extra: (extension && extension.extra) || {}
    };
    return player;
};
export const mapSteamIDToPlayer = (players, teams, extensions) => (steamid) => parsePlayer(players[steamid], steamid, teams[players[steamid].team], extensions);
export const parseTeam = (team, orientation, side, extension) => ({
    score: team.score,
    logo: (extension && extension.logo) || null,
    consecutive_round_losses: team.consecutive_round_losses,
    timeouts_remaining: team.timeouts_remaining,
    matches_won_this_series: (extension && extension.map_score) || team.matches_won_this_series,
    side,
    name: (extension && extension.name) || (side === 'CT' ? 'Counter-Terrorists' : 'Terrorists'),
    country: (extension && extension.country) || null,
    id: (extension && extension.id) || null,
    orientation,
    extra: (extension && extension.extra) || {}
});

let currentModules = []

const getARModule = (dir) => currentModules.find(arModule => arModule.id === dir) || null;

export const addARModule = async (dir, { scene, camera, renderers, GSI, actions }) => {
    const duplicate = getARModule(dir);

    if(duplicate){
        return;
    }
    const arModule = await import(`/ars/${dir}/index.js?cacheBust=${(new Date()).getTime()}`);

    if(!arModule || !arModule.startARModule || !arModule.cleanUpARModule){
        return;
    }
    const customCSS = document.createElement("link");
    customCSS.setAttribute("rel", "stylesheet");
    customCSS.setAttribute("type", "text/css");
    customCSS.setAttribute("id", `ar-stylesheet-${dir}`);
    customCSS.setAttribute("href", `/ars/${dir}/index.css?cacheBust=${(new Date()).getTime()}`);

    document.getElementsByTagName("head")[0].appendChild(customCSS);

    const moduleEntry = { id: dir, module: arModule }

    currentModules.push(moduleEntry);

    arModule.startARModule(scene, camera, renderers, GSI, actions);

    return;
}

export const removeARModule = (dir, { scene, GSI }) => {
    const customStyleSheet = document.getElementById(`ar-stylesheet-${dir}`);
    if (customStyleSheet) {
        customStyleSheet.remove();
    }

    const arModule = getARModule(dir);
    if(!arModule) return;

    arModule.module.cleanUpARModule(scene, GSI);
    return;
}

export const setActiveModules = async (dirs, arSettings) => {
    for(const dir of dirs) {
        const currentModule = getARModule(dir);
        if(!currentModule){
            await addARModule(dir, arSettings);
        }
    }
    for(const mod of currentModules){
        if(!dirs.includes(mod.id)){
            removeARModule(mod.id, arSettings);
            currentModules = currentModules.filter(duplicate => duplicate !== getARModule(mod.id));

        }
    }
}