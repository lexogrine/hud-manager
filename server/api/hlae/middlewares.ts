import { RequestHandler } from 'express';
import * as HLAE from './index';
export const setXrayHandler: RequestHandler = (req, res) => {
	const tXray = [...req.body.tXray] as number[];
	const ctXray = [...req.body.ctXray] as number[];

	HLAE.setXrayColors(ctXray, tXray);

	return res.sendStatus(200);
};
