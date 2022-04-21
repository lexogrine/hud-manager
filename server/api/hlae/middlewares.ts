import { RequestHandler } from 'express';
import { customer } from '..';
import { mirvPgl } from '../../socket';
import * as HLAE from './index';
export const setXrayHandler: RequestHandler = (req, res) => {
	if (
		customer?.customer?.license.type !== 'enterprise' &&
		customer?.customer?.license.type !== 'professional' &&
		!customer?.workspace
	)
		return res.sendStatus(403);
	const tXray = [...req.body.tXray] as number[];
	const ctXray = [...req.body.ctXray] as number[];

	HLAE.setXrayColors(ctXray, tXray);

	return res.sendStatus(200);
};
export const getHLAEStatus: RequestHandler = (req, res) => {
	return res.json({ connected: !!mirvPgl.socket });
};
