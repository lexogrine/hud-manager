"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDEBracket = exports.createSEBracket = void 0;
const v4_1 = __importDefault(require("uuid/v4"));
const createMatchup = () => ({
    _id: v4_1.default(),
    winner_to: null,
    loser_to: null,
    label: '',
    matchId: null,
    parents: []
});
const createSEBracket = (teams) => {
    if (!Number.isInteger(Math.log2(teams)))
        return [];
    const phases = Math.log2(teams);
    const matchups = [];
    for (let i = 0; i < phases; i++) {
        const matchesInPhase = 2 ** i;
        for (let j = 0; j < matchesInPhase; j++) {
            const match = createMatchup();
            const index = matchups.length;
            if (i === 0) {
                matchups.push(match);
                continue;
            }
            const parentIndex = Math.floor((index - 1) / 2);
            match.winner_to = matchups[parentIndex]._id;
            matchups.push(match);
        }
    }
    return matchups;
};
exports.createSEBracket = createSEBracket;
const createDEBracket = (teams) => {
    if (!Number.isInteger(Math.log2(teams)))
        return [];
    const upperBracket = exports.createSEBracket(teams);
    if (!upperBracket.length)
        return [];
    const grandFinal = createMatchup();
    upperBracket.push(grandFinal);
    upperBracket[0].winner_to = grandFinal._id;
    const grandFinalIndex = upperBracket.length - 1;
    const phases = Math.log2(teams / 2);
    for (let i = 0; i < phases; i++) {
        const lineMatches = 2 ** i;
        for (let j = 0; j < lineMatches; j++) {
            const loserAndWinner = createMatchup();
            const winnersOnly = createMatchup();
            const lAWI = lineMatches + j;
            loserAndWinner.winner_to = upperBracket[upperBracket.length - Math.ceil(lAWI / 2)]._id;
            upperBracket.push(loserAndWinner);
            winnersOnly.winner_to = upperBracket[upperBracket.length - lineMatches]._id;
            upperBracket.push(winnersOnly);
        }
    }
    for (let i = 0; i < grandFinalIndex; i++) {
        const upperHalf = teams / 2 - 1;
        if (i >= upperHalf) {
            const newI = Math.floor((i - upperHalf) / 2) + upperBracket.length - teams / 4;
            upperBracket[i].loser_to = upperBracket[newI]._id;
        }
        else {
            const phase = Math.floor(Math.log2(i + 1));
            const difference = 2 ** phase + grandFinalIndex;
            upperBracket[i].loser_to = upperBracket[i + difference]._id;
        }
    }
    return upperBracket;
};
exports.createDEBracket = createDEBracket;
