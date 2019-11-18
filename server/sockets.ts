import socketio from 'socket.io';
import http from 'http';
import express from 'express';
import CSGOGSI from 'csgogsi';
import { getMatchesV2, updateMatch } from './api/match';

const mirv = require("./server").default;


class HUDStateManager {
    data: Map<string, any>
    constructor() {
        this.data = new Map();
    }
    set(hud: string, section: string, data){
        const form = this.get(hud);
        const newForm = {...form, [section]: data};
        this.data.set(hud, newForm);
    }
    get(hud: string){
        return this.data.get(hud);
    }
}

export const HUDState = new HUDStateManager();

export const GSI = new CSGOGSI();

export default function (server: http.Server, app: express.Router) {
    let last = null;
    const io = socketio(server);

    app.post('/', (req, res) => {
        res.sendStatus(200);
        last = req.body;
        io.emit('update', req.body);
        GSI.digest(req.body);
    });

    io.on('connection', socket => {
        socket.on('ready', () => {
            if (last) {
                socket.emit("update", last);
            }
        });
        socket.on('hud_config', (data: { hud: string, section: string, config: any }) => {
            HUDState.set(data.hud, data.section, data.config);
            io.emit(`hud_config_${data.hud}`, HUDState.get(data.hud));
        });
        socket.on('hud_action', (data: { hud: string, action: any }) => {
            console.log(data);
            io.emit(`hud_action_${data.hud}`, data.action);
        })
        socket.on('get_config', (hud: string) => {
            socket.emit("hud_config", HUDState.get(hud));
        });
    });

    mirv(data => {
        io.emit("update_mirv", data);
    });

    GSI.on("roundEnd", score => {
        const matches = getMatchesV2();
        const match = matches.filter(match => match.current)[0];
        if(match){
            const {vetos} = match;
            vetos.map(veto => {
                if (veto.mapName !== score.map.name || !score.map.team_ct.id || !score.map.team_t.id) {
                    return veto;
                }
                if(!veto.score){
                    veto.score = {};
                }
                veto.score[score.map.team_ct.id] = score.map.team_ct.score;
                veto.score[score.map.team_t.id] = score.map.team_t.score;
                return veto;
            });
            match.vetos = vetos;
            updateMatch(matches);
            
            io.emit('match', true);
        }
    });

    
    GSI.on("matchEnd", async score => {
        const matches = getMatchesV2();
        const match = matches.filter(match => match.current)[0];
        if(match){
            const {vetos} = match;
            vetos.map(veto => {
                if (veto.mapName !== score.map.name || !score.map.team_ct.id || !score.map.team_t.id) {
                    return veto;
                }
                veto.winner = score.map.team_ct.score > score.map.team_t.score ? score.map.team_ct.id :score.map.team_t.id;
                veto.mapEnd = true;
                return veto;
            });
            if(match.left.id === score.winner.id){
                match.left.wins++;
            } else if(match.right.id === score.winner.id){
                match.right.wins++;
            }
            match.vetos = vetos;
            await updateMatch(matches);
            io.emit('match', true);
        }
    });

    return io;
}