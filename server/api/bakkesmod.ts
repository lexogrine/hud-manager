import fs from 'fs';
import path from 'path';
import { app as Application } from 'electron';
import express from 'express';
import request from 'request';
import del from 'del';
import { execFile } from 'child_process';

const DecompressZip = require('decompress-zip');

const tempDirPath = Application.getPath('temp');

const bakkesModDirPath = path.join(process.env.APPDATA || '', '/bakkesmod/bakkesmod');
const bakkesModConfigPath = path.join(bakkesModDirPath, 'cfg/plugins.cfg');
const bakkesModDownloadUrl =
	'https://github.com/bakkesmodorg/BakkesModInjectorCpp/releases/latest/download/BakkesModSetup.exe';
const bakkesModDownloadFilePath = path.join(tempDirPath, 'lhm_bakkesmod.exe');
const bakkesModPath = path.join(bakkesModDirPath, 'BakkesMod.exe');

const sosPluginFiles = ['plugins/SOS.dll', 'plugins/settings/sos.set'];
const sosPluginConfig = 'plugin load sos';
const sosPluginDownloadAPIPath = 'https://gitlab.com/api/v4/projects/16389912/releases';
const sosPluginDownloadUrlPrefix = 'https://gitlab.com/bakkesplugins/sos/sos-plugin';
const sosPluginDownloadFilePath = path.join(tempDirPath, 'lhm_sosplugin.zip');
const sosPluginExtractPath = path.join(tempDirPath, 'lhm_sosplugin_unpack');

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
		bakkesModDownloaded: false,
		bakkesModInstalled: false,
		sosPluginDownloaded: false,
		sosPluginInstalled: false,
		sosConfigSet: false,
		bakkesModRunning: false
	};

	if (fs.existsSync(bakkesModDownloadFilePath)) status.bakkesModDownloaded = true;
	if (fs.existsSync(sosPluginDownloadFilePath)) status.sosPluginDownloaded = true;
	if (fs.existsSync(bakkesModPath)) status.bakkesModInstalled = true;
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
			return res.json({ success: true, path: bakkesModDownloadFilePath });
		})
		.pipe(fs.createWriteStream(bakkesModDownloadFilePath));
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

export const installBakkesMod: express.RequestHandler = async (req, res) => {
	if (!fs.existsSync(bakkesModDownloadFilePath))
		return res.json({ success: false, message: 'BakkesMod needs to be downloaded first' });

	execFile(bakkesModDownloadFilePath, (error, _stdout, _stderr) => {
		if (error) {
			return res.json({ success: false, message: 'Failed to install BakkesMod', error });
		}
		if (!fs.existsSync(bakkesModConfigPath)) {
			return res.json({ success: false, message: 'BakkesMod installation failed' });
		}
		return res.json({ success: true });
	});
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
