import { MapAreaConfigWithPlayers } from '../observer';

const MAX_ELEMENTS_IN_QUEUE = 3;
const MAX_CONFIGS_IN_QUEUE_ELEMENT = 3;

interface QueueElement {
	areaName: string;
	lastConfigs: string[];
}

const queue: QueueElement[] = [];

export const isConfigAvailableForUsage = (areaName: string, configName: string) => {
	const areaInQueue = queue.find(element => element.areaName === areaName);
	if (!areaInQueue) {
		return true;
	}
	return !areaInQueue.lastConfigs.includes(configName);
};

export const addToQueue = (areaName: string, configName: string) => {
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

export const clearQueue = () => {
	queue.length = 0;
};
