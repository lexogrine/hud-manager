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
