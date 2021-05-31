import fs from 'fs';
import path from 'path';
import { app as Application } from 'electron';
import express from 'express';
import request from 'request';
import del from 'del';
import { exec, execFile, spawn } from 'child_process';
import { getGamePath } from 'steam-game-path';

const DecompressZip = require('decompress-zip');

const tempDirPath = Application.getPath('temp');

const bakkesModDirPath = path.join(process.env.APPDATA || '', '/bakkesmod/bakkesmod');
const bakkesModConfigPath = path.join(bakkesModDirPath, 'cfg/plugins.cfg');

const bakkesModDownloadUrl =
	'https://github.com/bakkesmodorg/BakkesModInjectorCpp/releases/latest/download/BakkesMod.exe';
const bakkesModExePath = path.join(bakkesModDirPath, 'lhm_bakkesmod.exe');

const bakkesModDataDownloadUrl =
	'https://github.com/bakkesmodorg/BakkesModInjectorCpp/releases/latest/download/bakkesmod.zip';
const bakkesModDataDownloadFilePath = path.join(tempDirPath, 'lhm_bakkesmod_data.zip');

const sosPluginFiles = ['plugins/SOS.dll', 'plugins/settings/sos.set'];
const sosPluginConfig = 'plugin load sos';
const sosPluginDownloadAPIPath = 'https://gitlab.com/api/v4/projects/16389912/releases';
const sosPluginDownloadUrlPrefix = 'https://gitlab.com/bakkesplugins/sos/sos-plugin';
const sosPluginDownloadFilePath = path.join(tempDirPath, 'lhm_sosplugin.zip');
const sosPluginExtractPath = path.join(tempDirPath, 'lhm_sosplugin_unpack');

const rocketLeagueUrl = 'com.epicgames.launcher://apps/Sugar?action=launch&silent=true';

const move = (oldPath: string, newPath: string, overwrite?: boolean) => {
	return new Promise<void>((resolve, reject) => {
		const justMove = () => {
			fs.rename(oldPath, newPath, err => {
				if (err) {
					if (err.code === 'EXDEV') {
						const readStream = fs.createReadStream(oldPath);
						const writeStream = fs.createWriteStream(newPath);

						readStream.on('error', () => {
							return reject();
						});
						writeStream.on('error', () => {
							return reject();
						});
						readStream.on('close', () =>
							fs.unlink(oldPath, () => {
								return resolve();
							})
						);

						readStream.pipe(writeStream);
					} else {
						console.log('Move error for:', oldPath, 'to', newPath, '>', err);
						return reject(err);
					}
				} else return resolve();
			});
		};

		if (overwrite) fs.unlink(newPath, justMove);
		else justMove();
	});
};

const verifyPluginList = () => {
	if (!fs.existsSync(bakkesModConfigPath)) return false;
	if (fs.readFileSync(bakkesModConfigPath).indexOf(sosPluginConfig) === -1) return false;
	return true;
};

export const checkStatus: express.RequestHandler = async (req, res) => {
	const status = {
		bakkesModExeDownloaded: false,
		bakkesModDataDownloaded: false,
		bakkesModDataInstalled: false,
		sosPluginDownloaded: false,
		sosPluginInstalled: false,
		sosConfigSet: false,
		bakkesModRunning: false
	};

	if (fs.existsSync(bakkesModExePath)) status.bakkesModExeDownloaded = true;
	if (fs.existsSync(bakkesModDataDownloadFilePath)) status.bakkesModDataDownloaded = true;
	if (fs.existsSync(sosPluginDownloadFilePath)) status.sosPluginDownloaded = true;
	if (fs.existsSync(bakkesModConfigPath)) status.bakkesModDataInstalled = true;
	if (fs.existsSync(path.join(bakkesModDirPath, sosPluginFiles[0]))) status.sosPluginInstalled = true;
	if (verifyPluginList()) status.sosConfigSet = true;

	return res.json({ success: true, status });
};

export const downloadBakkesMod: express.RequestHandler = async (req, res) => {
	request(bakkesModDownloadUrl)
		.on('error', () => {
			return res.json({ success: false });
		})
		.on('end', () => {
			return res.json({ success: true, path: bakkesModExePath });
		})
		.pipe(fs.createWriteStream(bakkesModExePath));
};

export const downloadBakkesModData: express.RequestHandler = async (req, res) => {
	request(bakkesModDataDownloadUrl)
		.on('error', () => {
			return res.json({ success: false });
		})
		.on('end', () => {
			return res.json({ success: true, path: bakkesModDataDownloadFilePath });
		})
		.pipe(fs.createWriteStream(bakkesModDataDownloadFilePath));
};

export const downloadSosPlugin: express.RequestHandler = async (req, res) => {
	request(sosPluginDownloadAPIPath, (error, _response, body) => {
		if (error) return res.json({ success: false });

		const results = JSON.parse(body);
		const partialUrl = results[0].description.match(/\/uploads\/.+?\.zip/);

		const url = sosPluginDownloadUrlPrefix + partialUrl;
		request(url)
			.on('error', () => {
				return res.json({ success: false });
			})
			.on('end', () => {
				return res.json({ success: true, path: sosPluginDownloadFilePath });
			})
			.pipe(fs.createWriteStream(sosPluginDownloadFilePath));
	});
};

export const runBakkesMod: express.RequestHandler = async (req, res) => {
	if (!fs.existsSync(bakkesModExePath))
		return res.json({ success: false, message: 'BakkesMod needs to be downloaded first' });

	//execFile(bakkesModExePath);
	spawn(bakkesModExePath, { detached: true, stdio: 'ignore' });

	// Try Steam first
	let useSteam = true;
	let gamePath = null;
	try {
		gamePath = getGamePath(252950);
	} catch {
		useSteam = false;
	}

	if (!gamePath || !gamePath.steam || !gamePath.steam.path || !gamePath.game || !gamePath.game.path) {
		useSteam = false;
	}

	const exePath = gamePath?.steam?.path && path.join(gamePath.steam.path, 'Steam.exe');

	if (useSteam && gamePath && exePath) {
		// const gameExePath = path.join(gamePath.game.path, 'Binaries/Win64/RocketLeague.exe');

		const steam = spawn(`"${exePath}"`, ['-applaunch 252950'], { detached: true, shell: true, stdio: 'ignore' });
		steam.unref();
	} else {
		const startCommand = process.platform === 'win32' ? 'start' : 'xdg-open';
		spawn(startCommand + ' ' + rocketLeagueUrl, { detached: true, stdio: 'ignore', shell: true });
	}
};

export const installBakkesModData: express.RequestHandler = async (req, res) => {
	if (!fs.existsSync(bakkesModDataDownloadFilePath))
		return res.json({ success: false, message: 'BakkesMod data needs to be downloaded first' });

	fs.mkdirSync(bakkesModDirPath, { recursive: true });

	const unzipper = new DecompressZip(bakkesModDataDownloadFilePath);
	unzipper.on('extract', async () => {
		return res.json({ success: true });
	});
	unzipper.on('error', (e: any) => {
		return res.json({
			success: false,
			message: 'Failed to unzip the BakkesMod data archive',
			error: e
		});
	});

	unzipper.extract({ path: bakkesModDirPath });
};

export const installSosPlugin: express.RequestHandler = async (req, res) => {
	if (!fs.existsSync(sosPluginDownloadFilePath))
		return res.json({ success: false, message: 'SOS plugin needs to be downloaded first' });

	if (fs.existsSync(sosPluginExtractPath)) {
		await del(sosPluginExtractPath, { force: true, expandDirectories: true });
		await del(sosPluginExtractPath, { force: true });
	}
	fs.mkdirSync(sosPluginExtractPath);

	const unzipper = new DecompressZip(sosPluginDownloadFilePath);
	unzipper.on('extract', async () => {
		try {
			await Promise.all(
				sosPluginFiles.map(f => move(path.join(sosPluginExtractPath, f), path.join(bakkesModDirPath, f), true))
			);
			if (!verifyPluginList()) {
				fs.appendFileSync(bakkesModConfigPath, '\n' + sosPluginConfig + '\n');
			}
			await del(sosPluginExtractPath, { force: true, expandDirectories: true });
			await del(sosPluginExtractPath, { force: true });
			return res.json({ success: true });
		} catch (e) {
			return res.json({
				success: false,
				message: 'Failed to install the SOS plugin files',
				error: e
			});
		}
	});
	unzipper.on('error', (e: any) => {
		return res.json({
			success: false,
			message: 'Failed to unzip the SOS plugin archive',
			error: e
		});
	});

	unzipper.extract({ path: sosPluginExtractPath });
};
