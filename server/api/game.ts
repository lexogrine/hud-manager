import fs from 'fs';
import path from 'path';
import { getGamePath } from 'steam-game-path';
import express from 'express';
import { loadConfig } from './config';
import { GSI } from '../sockets';
import { spawn } from 'child_process';
import { CFG } from '../../types/interfaces';
import { AFXInterop } from '../../electron';

function createCFG(customRadar: boolean, customKillfeed: boolean, afx: boolean, autoexec = true): CFG {
	let cfg = `cl_draw_only_deathnotices 1`;
	let file = 'hud';

	if (!customRadar) {
		cfg += `\ncl_drawhud_force_radar 1`;
	} else {
		cfg += `\ncl_drawhud_force_radar 0`;
		file += '_radar';
	}
	if (customKillfeed) {
		file += '_killfeed';
		cfg += `\ncl_drawhud_force_deathnotices -1`;
		cfg += `\nmirv_pgl url "ws://localhost:31337/mirv"`;
		cfg += `\nmirv_pgl start`;
	}
	if (afx) {
		file += '_interop';
		cfg = 'afx_interop connect 1';
		cfg += `\nexec ${createCFG(customRadar, customKillfeed, false).file}`;
	}
	file += '.cfg';
	if (!autoexec) {
		file = '';
	}
	return { cfg, file };
}

function exists(file: string) {
	try {
		return fs.existsSync(file);
	} catch {
		return false;
	}
}

function isCorrect(cfg: CFG) {
	try {
		const GamePath = getGamePath(730);
		if (!GamePath || !GamePath.game || !GamePath.game.path) {
			return false;
		}
		const file = cfg.file;
		const cfgDir = path.join(GamePath.game.path, 'csgo', 'cfg');
		return fs.readFileSync(path.join(cfgDir, file), 'UTF-8') === cfg.cfg;
	} catch {
		return false;
	}
}

export const checkCFGs: express.RequestHandler = async (req, res) => {
	const config = await loadConfig();
	const SteamGamePath = getGamePath(730);

	const gamePath = SteamGamePath?.game?.path;

	if (!config || !gamePath) {
		return res.json({ success: false, message: "Game path couldn't be found", accessible: false });
	}

	const switcher = [true, false];
	const cfgs: CFG[] = [];
	/*const afx_interop_cfg: CFG = {
        cfg: 'afx_interop connect 1',
        file: 'hud_interop.cfg'
    }
    cfgs.push(afx_interop_cfg);*/
	switcher.forEach(interop => {
		switcher.forEach(radar => {
			switcher.forEach(killfeed => {
				cfgs.push(createCFG(radar, killfeed, interop));
			});
		});
	});
	const files = cfgs.map(cfg => cfg.file);

	if (!files.map(file => path.join(gamePath, 'csgo', 'cfg', file)).every(exists)) {
		return res.json({ success: false, message: 'Files are missing', accessible: true });
	}
	if (!cfgs.every(isCorrect)) {
		return res.json({ success: false, message: 'CFGs is incorrect', accessible: true });
	}
	return res.json({ success: true });
};

export const createCFGs: express.RequestHandler = async (_req, res) => {
	let GamePath;
	try {
		GamePath = getGamePath(730);
	} catch {
		return res.json({ success: false, message: 'Unexpected error occured' });
	}
	if (!GamePath || !GamePath.game || !GamePath.game.path) {
		return res.json({ success: false, message: 'Unexpected error occured' });
	}
	const cfgDir = path.join(GamePath.game.path, 'csgo', 'cfg');

	try {
		const switcher = [true, false];

		const cfgs: CFG[] = [];
		/*const afx_interop_cfg: CFG = {
            cfg: 'afx_interop connect 1',
            file: 'hud_interop.cfg'
        }
        cfgs.push(afx_interop_cfg);*/

		switcher.forEach(interop => {
			switcher.forEach(radar => {
				switcher.forEach(killfeed => {
					cfgs.push(createCFG(radar, killfeed, interop));
				});
			});
		});
		for (const cfg of cfgs) {
			const cfgPath = path.join(cfgDir, cfg.file);
			if (fs.existsSync(cfgPath)) {
				fs.unlinkSync(cfgPath);
			}
			fs.writeFileSync(cfgPath, cfg.cfg, 'UTF-8');
		}
		return res.json({ success: true, message: 'Configs were successfully saved' });
	} catch {
		return res.json({ success: false, message: 'Unexpected error occured' });
	}
};

export const getLatestData: express.RequestHandler = async (_req, res) => {
	return res.json(GSI.last || {});
};

export const getSteamPath: express.RequestHandler = async (_req, res) => {
	try {
		const GamePath = getGamePath(730);
		if (!GamePath || !GamePath.steam || !GamePath.steam.path) {
			return res.status(404).json({ success: false });
		}
		return res.json({ success: true, steamPath: path.join(GamePath.steam.path, 'Steam.exe') });
	} catch {
		return res.status(404).json({ success: false });
	}
};

export const run: express.RequestHandler = async (req, res) => {
	const config = await loadConfig();
	if (!config) {
		return res.sendStatus(422);
	}

	const cfgData: { radar: boolean; killfeed: boolean; afx: boolean; autoexec: boolean } = req.body;
	const cfg = createCFG(cfgData.radar, cfgData.killfeed, cfgData.afx, cfgData.autoexec);

	const exec = cfg.file ? `+exec ${cfg.file}` : '';

	let GamePath;
	try {
		GamePath = getGamePath(730);
	} catch {
		return res.sendStatus(404);
	}
	if (!GamePath || !GamePath.steam || !GamePath.steam.path || !GamePath.game || !GamePath.game.path) {
		return res.sendStatus(404);
	}

	const HLAEPath = config.hlaePath;
	const GameExePath = path.join(GamePath.game.path, 'csgo.exe');

	const isHLAE = cfgData.killfeed || cfgData.afx;
	const exePath = isHLAE ? HLAEPath : path.join(GamePath.steam.path, 'Steam.exe');

	if (
		(isHLAE && (!HLAEPath || !fs.existsSync(HLAEPath))) ||
		(cfgData.afx && (!config.afxCEFHudInteropPath || !fs.existsSync(config.afxCEFHudInteropPath)))
	) {
		return res.sendStatus(404);
	}

	const args = [];
	const afxURL = `http://localhost:${config.port}/hlae.html`;
	if (!isHLAE) {
		args.push('-applaunch 730');
		if (exec) {
			args.push(exec);
		}
	} else {
		args.push('-csgoLauncher', '-noGui', '-autoStart', `-csgoExe "${GameExePath}"`);
		if (cfgData.afx) {
			if (exec) {
				args.push(`-customLaunchOptions "-afxInteropLight ${exec}"`);
			} else {
				args.push(`-customLaunchOptions "-afxInteropLight"`);
			}
		} else {
			args.push(`-customLaunchOptions "${exec}"`);
		}
	}

	try {
		const steam = spawn(`"${exePath}"`, args, { detached: true, shell: true, stdio: 'ignore' });
		steam.unref();
		if (cfgData.afx && !AFXInterop.process) {
			const process = spawn(`${config.afxCEFHudInteropPath}`, [`--url=${afxURL}`], { stdio: 'ignore' });
			AFXInterop.process = process;
		}
	} catch (e) {
		return res.sendStatus(500);
	}
	return res.sendStatus(200);
};
