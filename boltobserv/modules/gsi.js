const config = require("./../loadconfig")()
let oldPhase = false
let infernosOnMap = [] //initial molotov status
let io = null;

const socket = {
    send: (data) => {
        if(!io || !io.emit) return;
        io.of("/radar").emit(data.type, {data:data.data});
    }
}
module.exports = {
    init: socketio => {
        io = socketio;
        io.of("/radar").on("connection", socket => {
            if(!socket.emit) return;
            socket.emit("welcome", {data:{
                scripts: [
                    "advisory.js",
                    "bomb.js",
                    "loopFast.js",
                    "loopSlow.js",
                    "playerPosition.js",
                    "smokes.js"
                ],
                config: {
                    browser: config.browser,
                    radar: config.radar,
                    autozoom: config.autozoom
                }
            }})
        
        })
    },
    digest: (game) => {
        if (game.provider) {
            let connObject = {
                status: "up"
            }

            if (game.player) {
                if (game.player.activity != "playing") {
                    connObject.player = game.player.name
                }
            }

            socket.send({
                type: "connection",
                data: connObject
            })
        }

        if (game.map) {
            socket.send({
                type: "map",
                data: game.map.name
            })
        }

        if (game.allplayers) {
            let playerArr = []

            for (let id in game.allplayers) {
                if (!Number.isInteger(game.allplayers[id].observer_slot)) continue

                let player = game.allplayers[id]
                let pos = player.position.split(", ")
                let angle = 0
                let hasBomb = false
                let bombActive = false
                let isActive = false
                let rawAngle = player.forward.split(", ")

                if (parseFloat(rawAngle[0]) > 0) {
                    angle = 90 + parseFloat(rawAngle[1]) * -1 * 90
                }
                else {
                    angle = 270 + parseFloat(rawAngle[1]) * 90
                }

                if (game.player) {
                    if (game.player.observer_slot == player.observer_slot) {
                        isActive = true
                    }
                }

                for (let t in player.weapons) {
                    if (player.weapons[t].name == "weapon_c4") {
                        hasBomb = true
                        bombActive = player.weapons[t].state == "active"
                    }
                }

                playerArr.push({
                    id: id,
                    num: player.observer_slot,
                    team: player.team,
                    alive: player.state.health > 0,
                    active: isActive,
                    bomb: hasBomb,
                    bombActive: bombActive,
                    angle: angle,
                    position: {
                        x: parseFloat(pos[0]),
                        y: parseFloat(pos[1]),
                        z: parseFloat(pos[2])
                    }
                })
            }

            socket.send({
                type: "players",
                data: {
                    players: playerArr
                }
            })
        }

        if (game.grenades) {
            let smokes = []
            let nades = []
            let infernos = []
            for (let nadeID in game.grenades) {
                let nade = game.grenades[nadeID]

                if (nade.type == "smoke" && nade.velocity == "0.00, 0.00, 0.00") {
                    let pos = nade.position.split(", ")
                    smokes.push({
                        id: nadeID,
                        time: nade.effecttime,
                        position: {
                            x: parseFloat(pos[0]),
                            y: parseFloat(pos[1]),
                            z: parseFloat(pos[2])
                        }
                    })
                }
                if (nade.type == "inferno") {
                    if (!!nade.flames) {
                        let flamesPos = []
                        let flamesNum = Object.values(nade.flames).length
                        for (var i = 0; i < flamesNum; i++) {
                            flamesPos.push({
                                x: parseFloat(Object.values(nade.flames)[i].split(", ")[0]),
                                y: parseFloat(Object.values(nade.flames)[i].split(", ")[1]),
                                z: parseFloat(Object.values(nade.flames)[i].split(", ")[2]),
                            })
                        }
                        infernos.push({
                            id: nadeID,
                            flamesNum: flamesNum,
                            flamesPosition: flamesPos
                        })
                        if (infernosOnMap.indexOf(nadeID) == -1) { infernosOnMap.push(nadeID) }
                    }
                    else {

                    }
                }
            }
            for (let infernoOnMap of infernosOnMap) {
                if (!game.grenades[infernoOnMap]) {
                    socket.send({
                        type: "infernoRemove",
                        data: infernoOnMap
                    })
                }// check if molotov exist in game
            }
            socket.send({
                type: "smokes",
                data: smokes
            })
            socket.send({
                type: "infernos",
                data: infernos
            })
        }

        if (game.round) {
            socket.send({
                type: "round",
                data: game.round.phase
            })
            if (oldPhase == "over" && game.round.phase == "freezetime") {
                infernosOnMap = [] //clear molotov status every round
            }
        }

        if (game.bomb) {
            let pos = game.bomb.position.split(", ")

            socket.send({
                type: "bomb",
                data: {
                    state: game.bomb.state,
                    player: game.bomb.player,
                    position: {
                        x: parseFloat(pos[0]),
                        y: parseFloat(pos[1]),
                        z: parseFloat(pos[2])
                    }
                }
            })
        }
    }
}
