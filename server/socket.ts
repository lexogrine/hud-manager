import { Server, Socket } from 'socket.io';
import { CSGOGSI, CSGORaw, Score, Player, Team, mapSteamIDToPlayer } from 'csgogsi-socket';
import { DOTA2GSI } from 'dotagsi';
import fetch from 'node-fetch';
import { updateRound, updateMatch, getActiveGameMatches, reverseSide } from './api/matches';
import { internalIP, loadConfig, publicIP } from './api/config';
import { createNextMatch } from './api/tournaments';
import { customer } from './api';
import { isDev } from '../electron';
import { /*hlaeServer,*/ MIRVPGL } from './hlae';
import * as I from '../types/interfaces';
import { app, server } from '.';
import { HUDStateManager } from './api/huds/hudstatemanager';
import './api/huds/devhud';
import { getPlayersList } from './api/players';
import { sendKillsToARG } from './api/arg';

interface RuntimeConfig {
	last: CSGORaw | null;
	devSocket: Socket[];
	currentHUD: {
		url: string | null;
		isDev: boolean;
		dir: string;
	};
}

let lastUpdate = new Date().getTime();

let lastSideCheck = new Date().getTime();

export const runtimeConfig: RuntimeConfig = {
	last: null,
	devSocket: [],
	currentHUD: {
		url: null,
		isDev: false,
		dir: ''
	}
};

export const HUDState = new HUDStateManager();

export const GSI = new CSGOGSI();

export const Dota2GSI = new DOTA2GSI();

export const ioPromise = loadConfig().then(cfg => {
	const corsOrigins = [`http://${internalIP}:${cfg.port}`, `http://localhost:${cfg.port}`];

	if (publicIP) {
		corsOrigins.push(`http://${publicIP}:${cfg.port}`);
	}

	if (isDev) {
		corsOrigins.push('http://localhost:3000');
	}

	return new Server(server, {
		allowEIO3: true,
		cors: {
			origin: corsOrigins,
			credentials: true
		}
	});
});

export const mirvPgl = new MIRVPGL(ioPromise);

ioPromise.then(io => {
	const onRoundEnd = async (score: Score) => {
		const lastGSIEntry = GSI.current;
		if (lastGSIEntry) await updateRound(lastGSIEntry);
		if (score.loser && score.loser.logo) {
			score.loser.logo = '';
		}
		if (score.winner && score.winner.logo) {
			score.winner.logo = '';
		}
		const matches = await getActiveGameMatches();
		const match = matches.filter(match => match.current)[0];
		if (!match || match.game !== 'csgo') return;
		const { vetos } = match;
		const mapName = score.map.name.substring(score.map.name.lastIndexOf('/') + 1);
		vetos.map(veto => {
			if (veto.mapName !== mapName || !score.map.team_ct.id || !score.map.team_t.id || veto.mapEnd) {
				return veto;
			}
			if (!veto.score) {
				veto.score = {};
			}
			veto.score[score.map.team_ct.id] = score.map.team_ct.score;
			veto.score[score.map.team_t.id] = score.map.team_t.score;
			if (veto.reverseSide) {
				veto.score[score.map.team_t.id] = score.map.team_ct.score;
				veto.score[score.map.team_ct.id] = score.map.team_t.score;
			}
			if (score.mapEnd) {
				veto.winner =
					score.map.team_ct.score > score.map.team_t.score ? score.map.team_ct.id : score.map.team_t.id;
				if (veto.reverseSide) {
					veto.winner =
						score.map.team_ct.score > score.map.team_t.score ? score.map.team_t.id : score.map.team_ct.id;
				}
				if (match.left.id === score.winner.id) {
					if (veto.reverseSide) {
						match.right.wins++;
					} else {
						match.left.wins++;
					}
				} else if (match.right.id === score.winner.id) {
					if (veto.reverseSide) {
						match.left.wins++;
					} else {
						match.right.wins++;
					}
				}
				if (lastGSIEntry) {
					veto.game = lastGSIEntry;
				}

				veto.mapEnd = true;
			}
			return veto;
		});

		match.vetos = vetos;
		await updateMatch(match);

		if (score.mapEnd) {
			await createNextMatch(match.id);
		}

		io.emit('match', true);
	};

	GSI.on('roundEnd', onRoundEnd);

	GSI.on('data', csgo => {
		if (!GSI.last) return;
		sendKillsToARG(GSI.last, csgo);
	});

	Dota2GSI.on('matchEnd', async matchSummary => {
		const matches = await getActiveGameMatches();
		const match = matches.find(match => match.current && match.game === 'dota2');
		if (!match) return;

		const vetos = match.vetos as I.Dota2Veto[];
		const firstNotFinished = vetos.find(veto => !veto.mapEnd);

		let isReversed = false;

		if (firstNotFinished) {
			firstNotFinished.mapEnd = true;

			isReversed = !!firstNotFinished.reverseSide;
			if (matchSummary.teamId) {
				firstNotFinished.winner = matchSummary.teamId;
			}

			if (Dota2GSI.last && match.left.id && match.right.id) {
				const radiantScore = Dota2GSI.last.players
					.filter(player => player.team_name === 'dire')
					.map(player => player.deaths)
					.reduce((a, b) => a + b, 0);
				const direScore = Dota2GSI.last.players
					.filter(player => player.team_name === 'radiant')
					.map(player => player.deaths)
					.reduce((a, b) => a + b, 0);

				firstNotFinished.score = {};

				firstNotFinished.score[!isReversed ? match.left.id : match.right.id] = radiantScore;
				firstNotFinished.score[!isReversed ? match.right.id : match.left.id] = direScore;
			}
		}
		if (matchSummary.faction === 'radiant') {
			match[isReversed ? 'right' : 'left'].wins += 1;
		} else {
			match[!isReversed ? 'right' : 'left'].wins += 1;
		}
		await updateMatch(match);

		io.emit('match', true);
	});

	const doesPlayerBelongToOtherTeam = (playerExtensions: I.Player[], otherTeam: Team) => (player: Player) => {
		const extension = playerExtensions.find(data => data.steamid === player.steamid);
		if (!extension) return false;

		return player.team.id !== otherTeam.id && extension.team === otherTeam.id;
	};

	GSI.on('data', async data => {
		const now = new Date().getTime();

		if (now - lastSideCheck <= 5000) {
			return;
		}
		lastSideCheck = now;

		const cfg = await loadConfig();

		if (!cfg.autoSwitch) return;

		const game = customer.game;
		if (game !== 'csgo') return;

		if (!data.map.team_ct.id || !data.map.team_t.id) {
			return;
		}

		const ctPlayers = data.players.filter(player => player.team.side === 'CT');
		const tPlayers = data.players.filter(player => player.team.side === 'T');

		if (!ctPlayers.length || !tPlayers.length) return;

		const steamids = data.players.map(player => player.steamid);

		const $or: any[] = [
			{ game, steamid: { $in: steamids } },
			{ game: { $exists: false }, steamid: { $in: steamids } }
		];

		const playersData = await getPlayersList({ $or });

		if (playersData.length !== data.players.length) return;

		if (
			ctPlayers.every(doesPlayerBelongToOtherTeam(playersData, data.map.team_t)) &&
			tPlayers.every(doesPlayerBelongToOtherTeam(playersData, data.map.team_ct))
		) {
			reverseSide();
		}
	});

	GSI.on('data', data => {
		const now = new Date().getTime();
		if (now - lastUpdate > 300000 && customer.customer) {
			lastUpdate = new Date().getTime();
			const payload = {
				players: data.players.map(player => player.name),
				ct: {
					name: data.map.team_ct.name,
					score: data.map.team_ct.score
				},
				t: {
					name: data.map.team_t.name,
					score: data.map.team_t.score
				},
				user: customer.customer.user.id
			};
			try {
				fetch(`https://hmapi.lexogrine.com/users/payload`, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});
			} catch {}
		}
	});

	return io;
});
