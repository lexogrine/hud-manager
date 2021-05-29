"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearQueue = exports.addToQueue = exports.isConfigAvailableForUsage = void 0;
const MAX_ELEMENTS_IN_QUEUE = 3;
const MAX_CONFIGS_IN_QUEUE_ELEMENT = 3;
const queue = [];
exports.isConfigAvailableForUsage = (areaName, configName) => {
    const areaInQueue = queue.find(element => element.areaName === areaName);
    if (!areaInQueue) {
        return true;
    }
    return !areaInQueue.lastConfigs.includes(configName);
};
exports.addToQueue = (areaName, configName) => {
    const areaInQueue = queue.find(element => element.areaName === areaName);
    if (!areaInQueue) {
        if (queue.length >= MAX_ELEMENTS_IN_QUEUE) {
            queue.pop();
        }
        queue.unshift({ areaName, lastConfigs: [configName] });
        return;
    }
    if (areaInQueue.lastConfigs.length >= MAX_CONFIGS_IN_QUEUE_ELEMENT) {
        areaInQueue.lastConfigs.pop();
    }
    areaInQueue.lastConfigs.unshift(configName);
};
exports.clearQueue = () => {
    queue.length = 0;
};
