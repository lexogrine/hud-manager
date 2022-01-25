"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextData = void 0;
const react_1 = __importDefault(require("react"));
const defaultContext = {
    teams: [],
    tournaments: [],
    players: [],
    spaceUsed: 0,
    reload: () => { },
    matches: [],
    fields: { players: [], teams: [] },
    hash: '',
    game: 'csgo',
    workspaces: [],
    workspace: null
};
exports.ContextData = react_1.default.createContext(defaultContext);
