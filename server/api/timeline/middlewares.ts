import express from 'express';
import { dota2 } from './index';

export const getTimeline: express.RequestHandler = async (req, res) => {
	const game = req.params.game;
	if(game === "dota2"){
		return res.json(dota2.timeline)
	}
	return res.sendStatus(404);
};
