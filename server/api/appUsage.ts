/* eslint-disable no-console */
import * as I from '../../types/interfaces';
import { api } from './user';
import express from 'express';

const emptyStorePortion = {
	huds: 0,
	teams: 0,
	players: 0,
	matches: 0,
	tournaments: 0,
	cgmode: 0,
	aco: 0,
	arg: 0,
	ar: 0,
	live: 0,
	cameras: 0,
	settings: 0
};
const appUsageStore: Record<I.AvailableGames, Record<I.AppUsageAnalyticsType, number>> = {
	csgo: { ...emptyStorePortion },
	dota2: { ...emptyStorePortion },
	f1: { ...emptyStorePortion },
	rocketleague: { ...emptyStorePortion }
};

export const increaseAppUsage: express.RequestHandler = (req, res) => {
	if (
		!req.body.game ||
		!((req.body.game as string) in appUsageStore) ||
		!req.body.type ||
		!((req.body.type as string) in appUsageStore[req.body.game as I.AvailableGames])
	) {
		console.log('increaseAppUsage failed because type is not valid');
		return res.status(400).json({ success: false, error: 'Invalid usage type' });
	}
	appUsageStore[req.body.game as I.AvailableGames][req.body.type as I.AppUsageAnalyticsType]++;
	console.log('increaseAppUsage, store is now', appUsageStore);
	return res.json({ success: true });
};

export const getAppUsage: express.RequestHandler = (req, res) => {
	return res.json({ data: appUsageStore });
};

export const resetAppUsage: express.RequestHandler = (req, res) => {
	appUsageStore.csgo = { ...emptyStorePortion };
	appUsageStore.dota2 = { ...emptyStorePortion };
	appUsageStore.f1 = { ...emptyStorePortion };
	appUsageStore.rocketleague = { ...emptyStorePortion };
	return res.json({ success: true });
};

export const uploadAppUsage = async (): Promise<boolean> => {
	try {
		const data = Object.keys(appUsageStore)
			.map(game =>
				Object.keys(appUsageStore[game as I.AvailableGames]).map(type => ({
					type,
					game,
					count: appUsageStore[game as I.AvailableGames][type as I.AppUsageAnalyticsType]
				}))
			)
			.flat()
			.filter(item => item.count > 0);

		const result = await api('usage', 'POST', { data });

		return result;
	} catch (e) {
		console.error('Error while sending usage statistics:', e);
		return false;
	}
};
