"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateACOByMap = exports.getACOByMap = exports.getACO = void 0;
const index_1 = require("./index");
const getACO = async (req, res) => {
    const acos = await index_1.getACOs();
    return res.json(acos);
};
exports.getACO = getACO;
const getACOByMap = async (req, res) => {
    if (!req.params.mapName) {
        return res.sendStatus(422);
    }
    const aco = await index_1.getACOByMapName(req.params.mapName);
    if (!aco) {
        return res.sendStatus(404);
    }
    return res.json(aco);
};
exports.getACOByMap = getACOByMap;
const updateACOByMap = async (req, res) => {
    const result = await index_1.updateACO(req.body);
    if (!result) {
        return res.sendStatus(500);
    }
    const aco = await index_1.getACOByMapName(req.params.mapName);
    return res.json(aco);
};
exports.updateACOByMap = updateACOByMap;
