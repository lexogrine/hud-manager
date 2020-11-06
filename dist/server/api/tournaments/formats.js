"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.createDEBracket = exports.createSEBracket = void 0;
var v4_1 = __importDefault(require("uuid/v4"));
var createMatchup = function () { return ({
    _id: v4_1["default"](),
    winner_to: null,
    loser_to: null,
    label: '',
    matchId: null,
    parents: []
}); };
exports.createSEBracket = function (teams) {
    if (!Number.isInteger(Math.log2(teams)))
        return [];
    var phases = Math.log2(teams);
    var matchups = [];
    for (var i = 0; i < phases; i++) {
        var matchesInPhase = Math.pow(2, i);
        for (var j = 0; j < matchesInPhase; j++) {
            var match = createMatchup();
            var index = matchups.length;
            if (i === 0) {
                matchups.push(match);
                continue;
            }
            var parentIndex = Math.floor((index - 1) / 2);
            match.winner_to = matchups[parentIndex]._id;
            matchups.push(match);
        }
    }
    return matchups;
};
exports.createDEBracket = function (teams) {
    if (!Number.isInteger(Math.log2(teams)))
        return [];
    var upperBracket = exports.createSEBracket(teams);
    if (!upperBracket.length)
        return [];
    var grandFinal = createMatchup();
    upperBracket.push(grandFinal);
    upperBracket[0].winner_to = grandFinal._id;
    var grandFinalIndex = upperBracket.length - 1;
    var phases = Math.log2(teams / 2);
    for (var i = 0; i < phases; i++) {
        var lineMatches = Math.pow(2, i);
        for (var j = 0; j < lineMatches; j++) {
            var loserAndWinner = createMatchup();
            var winnersOnly = createMatchup();
            var lAWI = lineMatches + j;
            loserAndWinner.winner_to = upperBracket[upperBracket.length - Math.ceil(lAWI / 2)]._id;
            upperBracket.push(loserAndWinner);
            winnersOnly.winner_to = upperBracket[upperBracket.length - lineMatches]._id;
            upperBracket.push(winnersOnly);
        }
    }
    for (var i = 0; i < grandFinalIndex; i++) {
        var upperHalf = teams / 2 - 1;
        if (i >= upperHalf) {
            var newI = Math.floor((i - upperHalf) / 2) + upperBracket.length - teams / 4;
            upperBracket[i].loser_to = upperBracket[newI]._id;
        }
        else {
            var phase = Math.floor(Math.log2(i + 1));
            var difference = Math.pow(2, phase) + grandFinalIndex;
            upperBracket[i].loser_to = upperBracket[i + difference]._id;
        }
    }
    return upperBracket;
};
