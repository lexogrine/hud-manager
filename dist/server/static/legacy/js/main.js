
var io = io('http://' + ip + ':' + port + '/');
var avatars = {};

async function getAPI(url){
    return new Promise((res, rej) => {
        $.get(url, data => {
            res(data);
        })
    });
}
function loadAvatar(steamid, callback) {
    if(!avatars[steamid]){
        $.get("/av/" + steamid, function () {
            avatars[steamid] = true;
            if(callback) callback();
        });
    } else if(callback){
        callback();
    }
}

async function init(){
    const methods = {
        getState: function () {return this.state},
        getWeapons: function () {return this.weapons},
        getCurrentWeapon: function () {
            var weapons = this.getWeapons();
            if(weapons === false) return false;
            for (var k in weapons) {
                if (weapons[k].state == "active") return weapons[k];
            }
                        
        },
        getGrenades: function () {
            var grenades = [];
            var weapons = this.getWeapons();
            if(weapons === false) return false;
            for (var k in weapons) {
                if (weapons[k].type == "Grenade") grenades.push(weapons[k]);
            }
            return grenades;
        },
        getStats: function () {
            return {...this.match_stats, ...this.state};
        },
        getTeam: function () {return this.getTeam(extra.team)}
    }
    const functions = {
        getTeamOne: function(){
            if(!this.info.teams || !this.info.teams.team_1) return false;
            const base = this.getTeam(this.info.teams.team_1.team);
            const team = {...base, team_name: base.name}
            return team;
        },
        getTeamTwo: function(){
            if(!this.info.teams || !this.info.teams.team_2) return false;
            const base = this.getTeam(this.info.teams.team_2.team);
            const team = {...base, team_name: base.name}
            return team;
            //return this.getTeam(this.info.teams.team_2.team);
        },
        getTeam: function(id){
            return this.teams[id] || false;
        },
        getMatchType: function(){
            return (this.info.teams && this.info.teams.match ? this.info.teams.match : false);
        },
        getMatch: function(){
            return this.info.teams || false;
        },
        getPlayers: function () {
            if (!this.info.allplayers) return false;

            let players = [];

            for(var steamid in this.info.allplayers){
                let player = this.info.allplayers[steamid];

                if(player.observer_slot == 0) player.observer_slot = 10;

                const external = this.getExternal(steamid);
    
                let extra = {
                    ...this.getTeam(external.team),
                    ...external,
                };

                player = {
                    ...player,
                    steamid:steamid,
                    extra:extra,
                    ...methods
                };
                players.push(player);
            }

            players.sort(function(a,b){return a.observer_slot - b.observer_slot})
            return players;
        },
        getCT: function () {
            let all_players = [];
            let team_money = 0;
            let equip_value = 0;
            let team = {
                players: [],
                side:"ct"
            };

            if(!this.info.map || !this.info.map.team_ct) return false;
            
            team = {...team, ...this.info.map.team_ct};

            if (!team.name) 
                team.name = "Counter-terrorists";
            for (let sid in this.getPlayers()) {
                let player = this.getPlayers()[sid];
                if (player.team.toLowerCase() == "ct") {
                    if(player.state && (player.state.equip_value || player.state.money)){
                        team_money += player.state.money || 0;
                        equip_value += player.state.equip_value || 0;
                    }
                    all_players.push(player);
                }
            }
            team = {
                ...team,
                team_money: team_money,
                equip_value: equip_value,
                players: all_players
            }
            return team;
        },
        getT: function () {
            let all_players = [];
            let team_money = 0;
            let equip_value = 0;
            let team = {
                players: [],
                side:"t"
            };

            if (!this.info.map || !this.info.map.team_t) return false;

            team = {...team, ...this.info.map.team_t};

            if (!team.name) 
                team.name = "Terrorists";
            for (let sid in this.getPlayers()) {
                let player = this.getPlayers()[sid];
                if (player.team.toLowerCase() == "t") {
                    if (player.state && (player.state.equip_value || player.state.money)) {
                        team_money += player.state.money || 0;
                        equip_value += player.state.equip_value || 0;
                    }
                    all_players.push(player);
                }
            }
            team = {
                ...team,
                team_money: team_money,
                equip_value: equip_value,
                players: all_players
            }
            return team;
        },
        getObserved: function () {
            if(!this.info.player || this.info.player.steamid == 1) return false;

            let player = this.info.allplayers[this.info.player.steamid];

            const external = this.getExternal(this.info.player.steamid);

            let extra = {
                ...this.getTeam(external.team),
                ...external,
            };
            
            player = {
                ...player,
                extra: extra,
                ...methods,
                steamid: this.info.player.steamid
            }

            return player;
        },
        getExternal: function (steamid) {
            return this.extra[steamid] || {};
        },
        getPlayer: function (slot) {
            slot = parseInt(slot);
            if(!(slot >= 0 && slot <= 10)) return false;

            const players = this.getPlayers();

            for(var k in players){
                if(players[k].observer_slot === slot) return players[k];
            }
            return false;
        },
        phase: function () {
            if (!this.info.phase_countdowns) return false;
            return this.info.phase_countdowns;
        },
        round: function () {
            if (!this.info.round) return false;
            return this.info.round;
        },
        map: function () {
            if (!this.info.map)  return false;
            return this.info.map;
        },
        previously: function () {
            if (!this.info.previously) return false;
            return this.info.previously;
        }
    };
    const playersArray = await getAPI('/api/players');
    const teamsArray = await getAPI('/api/teams');
    const matches = await getAPI('/api/match');
    const match = matches.filter(match => match.current)[0];    
    console.log(match)
    const legacyMatch = {
        match: match.matchType,
        team_1: {
            map_score: match.left.wins,
            team: match.left.id,
        },
        team_2: {
            map_score: match.right.wins,
            team: match.right.id
        }

    }

    const teams = {};
    const players = {};
    
    playersArray.forEach(function(player) {
        players[player.steamid] = player;
    }, this);
    teamsArray.forEach(function(team) {
        teams[team._id] = team;
    }, this);
    io.on("update", json => {
        json.teams = legacyMatch;
        const update = {
            info: json,
            ...functions,
            extra: players,
            teams: teams,
        }
        updatePage(update);
    });
    
    io.emit('ready');
}
$(document).ready(() => {
    //const players = await getAPI('/api/players');
    //const teams = await getAPI('/api/teams');
    init();
})