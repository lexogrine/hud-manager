import { components } from '@octokit/openapi-types';
import { app } from 'electron';
import path from 'path';
// import fetch from 'node-fetch';
import { verifyInstallation } from './github';

const userData = app.getPath('userData');

export const useIntegrated = false;

export const hlaeExecutable = path.join(userData, 'hlae', 'HLAE.exe');
export const afxExecutable = path.join(userData, 'afx', 'Release', 'afx-cefhud-interop.exe');

const findHLAEAsset = (asset: components['schemas']['release-asset']) => {
	return asset.content_type === 'application/x-zip-compressed';
};

const findAFXAsset = (asset: components['schemas']['release-asset']) => {
	return asset.name === 'Release.7z';
};

const verifyHLAEInstallation = () =>
	verifyInstallation('advancedfx/advancedfx', path.join(userData, 'hlae'), findHLAEAsset).then(result => {
		console.log('HLAE INSTALLATION STAUTS', result);
	});

const verifyAFXInstallation = async () => {
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
		'v7.0.0.17-4dcfd4d'
	).then(result => {
		console.log('AFX INSTALLATION STATUS', result);
	});
};

export const verifyAdvancedFXInstallation = async () => {
	await verifyHLAEInstallation();
	await verifyAFXInstallation();
};
