/* eslint-disable no-console */
import init from './server';
import { Server } from 'http';
import * as directories from './init/directories';
import { ChildProcess, spawn, fork } from 'child_process';
import args from './init/args';
import path from 'path';
import fs from 'fs';
import { app, session } from 'electron';
import { createMainWindow } from './renderer';

interface HLAEChild {
	process: ChildProcess | null;
}

export const AFXInterop: HLAEChild = {
	process: null
};

export const isDev = process.env.DEV === 'true';

async function mainProcess(server: Server, forceDev = false, gui = true) {
	const cookieFile = path.join(app.getPath('userData'), 'databases', 'cookie');

	const cookie = fs.readFileSync(cookieFile, 'utf8');
	try {
		const cookies = JSON.parse(cookie);
		if (Array.isArray(cookies)) {
			for (const cookie of cookies) {
				cookie.url = 'https://hmapi.lexogrine.com/';
				await session.defaultSession.cookies.set(cookie);
			}
		}
	} catch (e) {}

	app.on('window-all-closed', app.quit);

	app.on('before-quit', async () => {
		const cookies = await session.defaultSession.cookies.get({ url: 'https://hmapi.lexogrine.com/' });

		fs.writeFileSync(cookieFile, JSON.stringify(cookies), 'utf8');
	});

	const RMTPServer = fork(require.resolve('./RMTPServer.js'));

	let renderer: ChildProcess = null;

	const closeManager = () => {
		if (server) {
			server.close();
		}
		if (AFXInterop.process) {
			AFXInterop.process.kill();
		}
		if (RMTPServer) {
			RMTPServer.kill();
		}
		app.quit();
	};

	app.on('quit', () => {
		if (renderer) renderer.kill();
		closeManager();
	});

	if (!gui) return;

	const args = ['./', '--renderer'];
	if (forceDev) args.push('--dev');
	renderer = spawn(process.execPath, args, {
		stdio: forceDev ? ['pipe', 'pipe', 'pipe', 'ipc'] : ['ignore', 'ignore', 'ignore', 'ipc']
	});

	app.on('second-instance', () => {
		if (renderer.send) {
			renderer.send('refocus');
		}
	});

	if (forceDev) renderer.stdout.on('data', data => console.log(data.toString()));

	renderer.on('exit', closeManager);
	renderer.on('close', closeManager);
}

async function startManager() {
	app.setAppUserModelId('com.lexogrine.hudmanager');
	if (process.argv.includes('--renderer')) {
		createMainWindow(process.argv.includes('--dev'));
		return;
	}
	directories.checkDirectories();
	const server = await init();
	const argv = args(process.argv);
	mainProcess(server, argv.dev, !argv.noGUI);
}

const lock = app.requestSingleInstanceLock();
if (!lock && !process.argv.includes('--renderer')) {
	app.quit();
} else {
	app.on('ready', startManager);
}
