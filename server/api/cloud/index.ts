import { api } from './../user';
import * as I from '../../../types/interfaces';
import { loadConfig, setConfig } from '../config';
import { getPlayersList, replaceLocalPlayers } from '../players';
import { getTeamsList, replaceLocalTeams } from '../teams';
import { getMatches, replaceLocalMatches } from '../matches';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { customer } from '..';

const cloudErrorHandler = () => {};

const getLastUpdateDateLocally = () => {
	const userData = app.getPath('userData');
	const database = path.join(userData, 'databases', 'lastUpdated.lhm');

	let lastUpdated = {} as I.LastUpdated;
	let saveOnFinish = true;

	try {
		if (fs.existsSync(database)) {
			saveOnFinish = false;
			lastUpdated = JSON.parse(fs.readFileSync(database, 'utf8'));
		}

		for (const game of I.availableGames) {
			for (const resource of I.availableResources) {
				if (!lastUpdated[game]) {
					lastUpdated[game] = {} as I.ResourceUpdateStatus;
				}
				//if (!lastUpdated[game][resource]) lastUpdated[game][resource] = new Date(0).toISOString();
			}
		}

		if (saveOnFinish) {
			fs.writeFileSync(database, JSON.stringify(lastUpdated), 'utf8');
		}

		return lastUpdated;
	} catch {
		for (const game of I.availableGames) {
			for (const resource of I.availableResources) {
				if (!lastUpdated[game]) {
					lastUpdated[game] = {} as I.ResourceUpdateStatus;
				}
				//if (!lastUpdated[game][resource]) lastUpdated[game][resource] = new Date(0).toISOString();
			}
		}
		return lastUpdated;
	}
};

const updateLastDateLocally = (game: I.AvailableGames, resources: I.ResourceResponseStatus[]) => {
	const lastUpdateLocal = getLastUpdateDateLocally();

	for (const resourceInfo of resources) {
		lastUpdateLocal[game][resourceInfo.resource] = resourceInfo.status;
	}

	const userData = app.getPath('userData');
	const database = path.join(userData, 'databases', 'lastUpdated.lhm');

	fs.writeFileSync(database, JSON.stringify(lastUpdateLocal), 'utf8');

	return lastUpdateLocal;
};

export const addResource = async <T>(game: I.AvailableGames, resource: I.AvailableResources, data: T | T[]) => {
	const result = (await api(`storage/${resource}/${game}`, 'POST', data)) as {
		entries: number;
		lastUpdateTime: string | null;
	};
	if (!result) {
		cloudErrorHandler();
		return null;
	}
	updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
	return result;
};

export const updateResource = async <T>(game: I.AvailableGames, resource: I.AvailableResources, data: T) => {
	const status = await checkCloudStatus(game);
	if (status !== 'ALL_SYNCED') {
		return;
	}
	const result = (await api(`storage/${resource}/${game}`, 'PATCH', data)) as I.CloudStorageData<T> & {
		lastUpdateTime: string | null;
	};
	if (!result) {
		cloudErrorHandler();
		return null;
	}
	updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
	return result;
};

export const deleteResource = async (game: I.AvailableGames, resource: I.AvailableResources, id: string) => {
	const status = await checkCloudStatus(game);
	if (status !== 'ALL_SYNCED') {
		return;
	}
	const result = (await api(`storage/${resource}/${game}/${id}`, 'DELETE')) as {
		success: boolean;
		lastUpdateTime: string;
	};
	console.log(result);
	if (!result || !result.success) {
		cloudErrorHandler();
		return null;
	}
	updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
	return result;
};

export const getResource = async (game: I.AvailableGames, resource: I.AvailableResources) => {
	const result = (await api(`storage/${resource}/${game}`)) as I.ResourcesTypes[];

	if (!result) {
		cloudErrorHandler();
		return null;
	}

	return result || null;
};

/**
 * If sync off (2.0+ was at least run once), do nothing.
 * Ask backend: Server will return EMPTY if no cloud data. Ask then if you want to upload current db
 * If data is on server, and no resources locally, syncing will be turned on and db downloaded
 * If there are resources locally, that were not synced, there will be options: upload local, download cloud, no sync
 * If data has the same time, do nothing
 * If local data is newer, ask which for option: upload local, download cloud, no sync
 * If local data is older, download cloud
 */

const downloadCloudData = async (game: I.AvailableGames, resource: I.AvailableResources) => {
	const replacer = {} as I.Replacer;

	for (const resource of I.availableResources) {
		switch (resource) {
			/*case 'matches':
				replacer.matches = replaceLocalMatches;
				break;*/
			case 'teams':
				replacer.teams = replaceLocalTeams;
				break;
			case 'players':
				replacer.players = replaceLocalPlayers;
				break;
		}
	}
	try {
		const resources = await getResource(game, resource);
		if (!resources) {
			return false;
		}
		console.log('reloading', resource, 'for', game);
		await replacer[resource](
			resources.map(resource => ({ ...resource, game })),
			game
		);

		return true;
	} catch {
		return false;
	}
};

export const downloadCloudToLocal = async (game: I.AvailableGames) => {
	try {
		const result = (await api(`storage/${game}/status`)) as I.ResourceResponseStatus[];
		await Promise.all(I.availableResources.map(resource => downloadCloudData(game, resource)));

		updateLastDateLocally(game, result);

		return true;
	} catch {
		return false;
	}
};

export const uploadLocalToCloud = async (game: I.AvailableGames) => {
	const resources = await Promise.all([getPlayersList({ game }), getTeamsList({ game }) /*, getMatches()*/]);

	const mappedResources = {
		players: resources[0],
		teams: resources[1]
		//matches: resources[2],
	} as { [resource in I.AvailableResources]: any };
	try {
		const result = [] as { entries: number; lastUpdateTime: string | null }[];
		for (const resource of I.availableResources) {
			const response = await addResource(game, resource, mappedResources[resource]);
			if (!response) return false;
			result.push(response);
		}
		return result.every(response => response.lastUpdateTime);
	} catch {
		return false;
	}
};

export const checkCloudStatus = async (game: I.AvailableGames) => {
	if (customer.customer?.license.type !== 'professional' && customer.customer?.license.type !== 'enterprise') {
		return 'ALL_SYNCED';
	}
	const cfg = await loadConfig();

	if (cfg.sync === false) return 'ALL_SYNCED';

	if (!cfg.sync) {
		await setConfig({ ...cfg, sync: true });
	}

	try {
		const result = (await api(`storage/${game}/status`)) as I.ResourceResponseStatus[];
		if (result.every(status => !status.status)) {
			// No remote resources
			// Ask if to upload current db - rejection will result in cloud option turned off
			console.log('NO REMOTE RESOURCES, UPLOAD?');
			return 'NO_UPLOADED_RESOURCES';
		}

		const lastUpdateStatusOnline = {} as I.ResourceUpdateStatus;

		for (const resourceStatus of result) {
			lastUpdateStatusOnline[resourceStatus.resource] = resourceStatus.status;
		}

		const resources = await Promise.all([getPlayersList({ game }), getTeamsList({ game }) /*, getMatches()*/]);

		if (resources.every(resource => !resource.length)) {
			// no local resources
			// download db
			console.log('NO LOCAL RESOURCES, DOWNLOADING...');

			await Promise.all(I.availableResources.map(resource => downloadCloudData(game, resource)));

			updateLastDateLocally(game, result);

			return 'ALL_SYNCED';
		}

		const lastUpdateStatusLocal = getLastUpdateDateLocally();

		if (I.availableResources.find(availableResource => !lastUpdateStatusLocal[game][availableResource])) {
			// resources exist both locally and remotely, but local db wasnt ever synced
			// show options: download cloud, no sync
			console.log('SYNC CONFLICT, WHAT DO? #1');
			return 'NO_SYNC_LOCAL';
		}

		const nonSyncedResources = I.availableResources.filter(
			availableResource =>
				lastUpdateStatusOnline[availableResource] !== lastUpdateStatusLocal[game][availableResource]
		);

		if (!nonSyncedResources.length) {
			// All resources are supposed to be in sync here
			console.log('NICE. no reason to sync');

			return 'ALL_SYNCED';
		}

		if (
			nonSyncedResources.find(
				resource =>
					!lastUpdateStatusOnline[resource] ||
					new Date(lastUpdateStatusLocal[game][resource] as any) >
						new Date(lastUpdateStatusOnline[resource] as any)
			)
		) {
			// Local data found newer, show options
			console.log('SYNC CONFLICT, WHAT DO? #2');
			return 'NO_SYNC_LOCAL';
		}

		// Local data older, download non-synced resources

		await Promise.all(nonSyncedResources.map(resource => downloadCloudData(game, resource)));

		updateLastDateLocally(
			game,
			result.filter(resource => nonSyncedResources.includes(resource.resource))
		);

		console.log('NICE');

		return 'ALL_SYNCED';
	} catch (e) {
		console.log(e);
		return 'UNKNOWN_ERROR';
	}
};
