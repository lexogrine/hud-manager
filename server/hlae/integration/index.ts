import { components } from '@octokit/openapi-types';
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
// import fetch from 'node-fetch';
import { getAssetVersion, verifyInstallation } from './github';
import { hlaeEmitter } from '..';
import { mirvPgl } from '../../socket';

const userData = app.getPath('userData');
const useIntegratedSettingsPath = path.join(userData, 'integrated.lhm');

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export let useIntegrated = false;

fs.promises
	.readFile(useIntegratedSettingsPath, 'utf-8')
	.then(content => {
		useIntegrated = content === 'true';
	})
	.catch(() => {});

export const hlaeExecutable = path.join(userData, 'hlae', 'HLAE.exe');
export const afxExecutable = path.join(userData, 'afx', 'Release', 'afx-cefhud-interop.exe');

let useIntegratedUpdater: Promise<void> | null = null;

const updateUseIntegrated = (newUseIntegrated: boolean, win: BrowserWindow) => {
	const getIntegratedUpdate = async () => {
		await wait(100);
		return fs.promises.writeFile(useIntegratedSettingsPath, newUseIntegrated ? 'true' : 'false').then(() => {
			useIntegrated = newUseIntegrated;
			win.webContents.send('usePreinstalled', newUseIntegrated);
			useIntegratedUpdater = null;
		});
	};
	if (!useIntegratedUpdater) {
		useIntegratedUpdater = getIntegratedUpdate();
		return;
	}
	useIntegratedUpdater = useIntegratedUpdater.then(getIntegratedUpdate);
};

const findHLAEAsset = (asset: components['schemas']['release-asset']) => {
	return asset.content_type === 'application/x-zip-compressed';
};

const findAFXAsset = (asset: components['schemas']['release-asset']) => {
	return asset.name === 'Release.7z';
};

const verifyHLAEInstallation = (win: BrowserWindow) =>
	verifyInstallation('advancedfx/advancedfx', path.join(userData, 'hlae'), findHLAEAsset, win).then(result => {
		console.log('HLAE INSTALLATION STAUTS', result);
	});

const verifyAFXInstallation = async (win: BrowserWindow) => {
	/*const releases = (await fetch('https://api.github.com/repos/advancedfx/afx-cefhud-interop/releases').then(res =>
		res.json()
	)) as components['schemas']['release'][];
	const latestReleaseWithExecutable = releases.find(release => release.assets.find(findAFXAsset));
	if (!latestReleaseWithExecutable) {
		console.log('No AFX executables found');
		return;
	}*/
	return verifyInstallation(
		'advancedfx/afx-cefhud-interop',
		path.join(userData, 'afx'),
		findAFXAsset,
		win,
		'v7.0.0.17-4dcfd4d'
	).then(result => {
		console.log('AFX INSTALLATION STATUS', result);
	});
};

export const verifyAdvancedFXInstallation = async (win: BrowserWindow) => {
	hlaeEmitter.on('hlaeStatus', (status: boolean) => {
		win.webContents.send('hlaeStatus', status);
	});
	ipcMain.on('getHlaeStatus', ev => {
		ev.reply('hlaeStatus', !!mirvPgl.socket);
	});
	ipcMain.on('getPreinstalled', ev => {
		ev.reply('usePreinstalled', useIntegrated);
	});

	ipcMain.on('setUsePreinstalled', (_ev, newUseIntegrated: boolean) => {
		updateUseIntegrated(newUseIntegrated, win);
	});

	ipcMain.on('getAfxVersion', ev => {
		ev.reply('advancedFxVersion', 'afx', getAssetVersion(path.join(userData, 'afx')));
	});
	ipcMain.on('getHlaeVersion', ev => {
		ev.reply('advancedFxVersion', 'hlae', getAssetVersion(path.join(userData, 'hlae')));
	});
	await verifyHLAEInstallation(win);
	await verifyAFXInstallation(win);
};
