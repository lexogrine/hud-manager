import fs, { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { app, BrowserWindow } from 'electron';
import fetch from 'node-fetch';
import { components } from '@octokit/openapi-types';
//let { zip, unzip } = require('cross-unzip')
const { unzip } = require('cross-unzip');

const archivesDirectory = path.join(app.getPath('userData'), 'archives');

const streamPipeline = promisify(pipeline);

const remove = (pathToRemove: string, leaveRoot = false) => {
	if (!fs.existsSync(pathToRemove)) {
		return;
	}
	const files = fs.readdirSync(pathToRemove);
	files.forEach(function (file) {
		const current = path.join(pathToRemove, file);
		if (fs.lstatSync(current).isDirectory()) {
			// recurse
			remove(current);
			if (fs.existsSync(current)) fs.rmdirSync(current);
		} else {
			// delete file
			if (fs.existsSync(current)) fs.unlinkSync(current);
		}
	});
	if (!leaveRoot) fs.rmdirSync(pathToRemove);
};

const fetchAsset = async (url: string, path: string) => {
	const response = await fetch(url);

	if (!response.ok) return false;

	await streamPipeline(response.body, createWriteStream(path));

	return true;
};

const clearCurrentInstallation = (path: string) => {
	remove(path, true);
};

const updateAsset = async (asset: components['schemas']['release-asset'], directory: string, version: string) => {
	const archivePath = path.join(archivesDirectory, asset.name);

	const result = await fetchAsset(asset.browser_download_url, archivePath);

	if (!result) return false;

	clearCurrentInstallation(directory);

	return new Promise<boolean>(res => {
		unzip(archivePath, directory, (err: any) => {
			console.log(err);

			remove(archivesDirectory, true);

			if (!err) {
				const versionFilePath = path.join(directory, 'version');

				fs.writeFileSync(versionFilePath, version, 'utf-8');
			}

			res(!err);
		});
	});
};

export const verifyInstallation = async (
	repo: string,
	directory: string,
	findAsset: (asset: components['schemas']['release-asset']) => boolean,
	win: BrowserWindow,
	tag?: string
) => {
	const githubURL = tag
		? `https://api.github.com/repos/${repo}/releases/tags/${tag}`
		: `https://api.github.com/repos/${repo}/releases/latest`;
	const response = (await fetch(githubURL).then(res => res.json())) as components['schemas']['release'];
	console.log(`Looking for ${repo} releases`);
	if (!response?.tag_name) return null;
	console.log(`Found ${repo}`, response.tag_name);
	const versionFilePath = path.join(directory, 'version');

	try {
		const content = fs.readFileSync(versionFilePath, 'utf-8');
		if (content === response.tag_name) return true;
	} catch {}
	console.log(`No current ${repo} detected`);
	const asset = response.assets?.find(findAsset);

	if (!asset) return true;
	console.log(`Found asset for ${repo}, downloading`);

	const result = await updateAsset(asset, directory, response.tag_name);

	return result;
};