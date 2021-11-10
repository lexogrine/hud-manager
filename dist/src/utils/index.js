"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterMatches = exports.canPlanUseCloudStorage = exports.getMissingFields = exports.getMatchName = void 0;
const moment_1 = __importDefault(require("moment"));
const getMatchName = (match, teams, longNames = false) => {
    if (!match)
        return '';
    if (!teams.length || !match.left.id || !match.right.id)
        return match.id;
    const left = teams.find(team => team._id === match.left.id);
    const right = teams.find(team => team._id === match.right.id);
    if (!left || !right)
        return match.id;
    if (longNames) {
        return `${left.name} (${match.left.wins}) vs (${match.right.wins}) ${right.name}`;
    }
    return `${left.shortName} (${match.left.wins}) vs (${match.right.wins}) ${right.shortName}`;
};
exports.getMatchName = getMatchName;
const getMissingFields = (currentFields, requiredFields) => {
    if (!requiredFields) {
        return;
    }
    const missingFields = {};
    if (requiredFields.players) {
        for (const [field, type] of Object.entries(requiredFields.players)) {
            if (!currentFields.players.find(playerField => playerField.name === field && playerField.type === type)) {
                if (!missingFields.players) {
                    missingFields.players = {};
                }
                missingFields.players[field] = type;
            }
        }
    }
    if (requiredFields.teams) {
        for (const [field, type] of Object.entries(requiredFields.teams)) {
            if (!currentFields.teams.find(teamField => teamField.name === field && teamField.type === type)) {
                if (!missingFields.teams) {
                    missingFields.teams = {};
                }
                missingFields.teams[field] = type;
            }
        }
    }
    if (!missingFields.players && !missingFields.teams) {
        return;
    }
    return missingFields;
};
exports.getMissingFields = getMissingFields;
const canPlanUseCloudStorage = (plan) => {
    if (!plan || plan === 'free')
        return false;
    return true;
};
exports.canPlanUseCloudStorage = canPlanUseCloudStorage;
const filterMatches = (match, activeTab) => {
    const boToWinsMap = {
        1: 1,
        2: 2,
        3: 2,
        5: 3
    };
    const picks = (match.vetos || []).filter(veto => match.game !== 'csgo' || veto.type !== 'ban');
    let isEnded = false;
    const bo = parseInt((match.matchType || 'bo1').replace('bo', ''));
    if (bo === 2) {
        isEnded = picks.filter(pick => pick.mapEnd).length === 2 || match.left.wins + match.right.wins >= 2;
    }
    else {
        isEnded =
            (match.left && match.left.wins === boToWinsMap[bo]) ||
                (match.right && match.right.wins === boToWinsMap[bo]);
    }
    if (activeTab === 'ended') {
        return isEnded;
    }
    if (isEnded) {
        return false;
    }
    const isInFuture = Boolean(match.startTime && (0, moment_1.default)(match.startTime).isAfter((0, moment_1.default)(), 'day'));
    return isInFuture === (activeTab === 'future');
};
exports.filterMatches = filterMatches;
