/* eslint-disable no-console */
import init from './server';
import { Server } from 'http';
import * as directories from './init/directories';
import { ChildProcess, spawn, fork } from 'child_process';
import args from './init/args';
import { app } from 'electron';
import { createMainWindow } from './renderer';

interface HLAEChild {
	process: ChildProcess | null;
}

export const AFXInterop: HLAEChild = {
	process: null
};

export const isDev = process.env.DEV === 'true';

async function mainProcess(server: Server, forceDev = false, gui = true) {
	const RMTPServer = fork(require.resolve('./RMTPServer.js'));

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

	app.on('window-all-closed', () => {});

	if (!gui) return;

	const args = ['./', '--renderer'];
	if (forceDev) args.push('--dev');
	const renderer = spawn(process.execPath, args, {
		stdio: forceDev ? ['pipe', 'pipe', 'pipe', 'ipc'] : ['ignore', 'ignore', 'ignore', 'ipc']
	});

	app.on('second-instance', () => {
		if (renderer.send) {
			renderer.send('refocus');
		}
	});

	if (forceDev) renderer.stdout?.on('data', data => console.log(data.toString()));

	renderer.on('exit', closeManager);
	renderer.on('close', closeManager);

	app.on('quit', () => {
		renderer.kill();
	});
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
	mainProcess(server, argv.dev || isDev, !argv.noGUI);
}

const lock = app.requestSingleInstanceLock();
if (!lock && !process.argv.includes('--renderer')) {
	app.quit();
} else {
	app.on('ready', startManager);
}
