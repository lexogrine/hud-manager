import { api, socket } from './../user';
import * as I from '../../../types/interfaces';
import { loadConfig, setConfig } from '../config';
import { getPlayersList, replaceLocalPlayers } from '../players';
import { getTeamsList, replaceLocalTeams } from '../teams';
import { getACOs, replaceLocalMapConfigs } from '../aco';
import { getActiveGameMatches, getMatches, replaceLocalMatches } from '../matches';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { customer } from '..';
import { getCustomFieldsDb, replaceLocalCustomFieldStores } from '../fields';
import * as Sentry from '@sentry/node';
import c from 'fetch-cookie';
import { replaceLocalTournaments } from '../tournaments/middlewares';
import { getTournaments } from '../tournaments';

const cloudErrorHandler = () => {};

const getResources = (game: I.AvailableGames) => {
	return Promise.all([
		getPlayersList({ game }),
		getTeamsList({ game }),
		getCustomFieldsDb(game),
		getACOs(),
		getActiveGameMatches(),
		getTournaments({ game })
	]);
};

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
			if (!lastUpdated[game]) {
				lastUpdated[game] = {} as I.ResourceUpdateStatus;
			}
			//if (!lastUpdated[game][resource]) lastUpdated[game][resource] = new Date(0).toISOString();
		}

		if (saveOnFinish) {
			fs.writeFileSync(database, JSON.stringify(lastUpdated), 'utf8');
		}

		return lastUpdated;
	} catch (e) {
		Sentry.captureException(e);
		for (const game of I.availableGames) {
			if (!lastUpdated[game]) {
				lastUpdated[game] = {} as I.ResourceUpdateStatus;
			}
			//if (!lastUpdated[game][resource]) lastUpdated[game][resource] = new Date(0).toISOString();
		}
		if (saveOnFinish) {
			fs.writeFileSync(database, JSON.stringify(lastUpdated), 'utf8');
		}
		return lastUpdated;
	}
};

const updateLastDateLocally = (game: I.AvailableGames, resources: I.ResourceResponseStatus[], blockUpdate = false) => {
	const lastUpdateLocal = getLastUpdateDateLocally();

	for (const resourceInfo of resources) {
		lastUpdateLocal[game][resourceInfo.resource] = resourceInfo.status;
	}

	const userData = app.getPath('userData');
	const database = path.join(userData, 'databases', 'lastUpdated.lhm');

	fs.writeFileSync(database, JSON.stringify(lastUpdateLocal), 'utf8');
	if (socket && !blockUpdate) {
		socket.send('init_db_update');
	}
	return lastUpdateLocal;
};

export const updateLastDateLocallyOnly = (game: I.AvailableGames | null, resources: I.AvailableResources[]) => {
	if(!game || !resources.length) return;
	updateLastDateLocally(game, resources.map(resource => ({ resource, status: (new Date()).toISOString() })), true);
}

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

export const deleteResource = async (game: I.AvailableGames, resource: I.AvailableResources, id: string | string[]) => {
	const status = await checkCloudStatus(game);
	if (status !== 'ALL_SYNCED') {
		return;
	}

	const ids = typeof id === 'string' ? id : id.join(';');

	const result = (await api(`storage/${resource}/${game}/${ids}`, 'DELETE')) as {
		success: boolean;
		lastUpdateTime: string;
	};
	if (!result || !result.success) {
		cloudErrorHandler();
		return null;
	}
	updateLastDateLocally(game, [{ resource, status: result.lastUpdateTime }]);
	return result;
};

export const getResource = async (game: I.AvailableGames, resource: I.AvailableResources, fromDate?: string | null) => {
	let url = `storage/${resource}/${game}`;
	if (fromDate) {
		url += `?fromDate=${fromDate}`;
	}
	const result = (await api(url)) as I.CachedResponse;

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

const downloadCloudData = async (game: I.AvailableGames, resource: I.AvailableResources, fromDate?: string | null) => {
	const replacer = {} as I.Replacer;

	for (const resource of I.availableResources) {
		switch (resource) {
			case 'tournaments':
				replacer.tournaments = replaceLocalTournaments;
				break;
			case 'matches':
				replacer.matches = replaceLocalMatches;
				break;
			case 'customs':
				replacer.customs = replaceLocalCustomFieldStores;
				break;
			case 'teams':
				replacer.teams = replaceLocalTeams;
				break;
			case 'players':
				replacer.players = replaceLocalPlayers;
				break;
			case 'mapconfigs':
				replacer.mapconfigs = replaceLocalMapConfigs;
				break;
		}
	}
	try {
		const resources = await getResource(game, resource, fromDate);
		if (!resources) {
			return false;
		}
		console.log('reloading', resource, 'for', game);
		await replacer[resource](
			resources.resources.map(resource => ({ ...resource, game })),
			game,
			resources.existing
		);

		return true;
	} catch (e) {
		Sentry.captureException(e);
		return false;
	}
};

export const downloadCloudToLocal = async (game: I.AvailableGames) => {
	try {
		const result = (await api(`storage/${game}/status`)) as I.ResourceResponseStatus[];
		await Promise.all(I.availableResources.map(resource => downloadCloudData(game, resource)));

		updateLastDateLocally(game, result);

		return true;
	} catch (e) {
		Sentry.captureException(e);
		return false;
	}
};

export const uploadLocalToCloud = async (game: I.AvailableGames) => {
	const resources = await getResources(game);

	const mappedResources = {
		players: resources[0],
		teams: resources[1],
		customs: resources[2],
		mapconfigs: resources[3],
		matches: resources[4],
		tournaments: resources[5]
	} as { [resource in I.AvailableResources]: any };
	try {
		const result = [] as { entries: number; lastUpdateTime: string | null }[];
		for (const resource of I.availableResources) {
			const response = await addResource(game, resource, mappedResources[resource]);
			if (!response) return false;
			result.push(response);
		}
		return result.every(response => response.lastUpdateTime);
	} catch (e) {
		Sentry.captureException(e);
		return false;
	}
};

export const checkCloudStatus = async (game: I.AvailableGames) => {
	console.log('CHECKING CLOUD...');
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

		const resources = await getResources(game);

		if (resources.every(resource => !resource.length)) {
			// no local resources
			// download db
			console.log('NO LOCAL RESOURCES, DOWNLOADING...');

			await Promise.all(I.availableResources.map(resource => downloadCloudData(game, resource)));

			updateLastDateLocally(game, result);

			return 'ALL_SYNCED';
		}

		const mappedResources = {
			players: resources[0],
			teams: resources[1],
			customs: resources[2],
			mapconfigs: resources[3],
			matches: resources[4],
			tournaments: resources[5]
		} as { [resource in I.AvailableResources]: any[] };

		const lastUpdateStatusLocal = getLastUpdateDateLocally();

		const syncConflicted = I.availableResources.filter(
			availableResource =>
				!lastUpdateStatusLocal[game][availableResource] &&
				lastUpdateStatusOnline[availableResource] &&
				mappedResources[availableResource].length
		);

		if (syncConflicted.length) {
			// resources exist both locally and remotely, but local db wasnt ever synced
			// show options: download cloud, no sync
			console.log('SYNC CONFLICT, WHAT DO? #1', syncConflicted);
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

		await Promise.all(
			nonSyncedResources.map(resource => downloadCloudData(game, resource, lastUpdateStatusLocal[game][resource]))
		);

		updateLastDateLocally(
			game,
			result.filter(resource => nonSyncedResources.includes(resource.resource))
		);

		return 'ALL_SYNCED';
	} catch (e) {
		Sentry.captureException(e);
		return 'UNKNOWN_ERROR';
	}
};
