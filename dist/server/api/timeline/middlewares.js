"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeline = void 0;
const index_1 = require("./index");
const getTimeline = async (req, res) => {
    const game = req.params.game;
    if (game === 'dota2') {
        return res.json(index_1.dota2.timeline);
    }
    return res.sendStatus(404);
};
exports.getTimeline = getTimeline;
