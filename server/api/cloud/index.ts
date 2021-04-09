import { api } from './../user';
import * as I from '../../../types/interfaces';

const cloudErrorHandler = () => {};

/**
 *
 * return sdf
 */

/**
 * If sync off (2.0+ was at least run once), do nothing.
 * Ask backend: Server will return EMPTY if no cloud data. Ask then if you want to upload current db
 * If data is on server, and no resources locally, syncing will be turned on and db downloaded
 * If there are resources locally, that were not synced, there will be options: upload local, download cloud, no sync
 * If data has the same time, do nothing
 * If local data is newer, ask which for option: upload local, download cloud, no sync
 * If local data is older, download cloud
 */
export const verifyCloudSync = () => {};

export const addResource = async <T>(game: I.AvailableGames, resource: I.AvailableResources, data: T) => {
	const result = (await api(`storage/${resource}/${game}`, 'POST', data)) as T;
	if (!result) {
		cloudErrorHandler();
		return null;
	}
	return result;
};

export const getResource = async <T>(game: I.AvailableGames, resource: I.AvailableResources) => {
	const result = (await api(`storage/${resource}/${game}`)) as T;

	if (!result) {
		cloudErrorHandler();
		return null;
	}

	return result || null;
};
