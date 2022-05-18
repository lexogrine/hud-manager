/* eslint-disable no-console */
import init from './server';
import { Server } from 'http';
import * as directories from './init/directories';
import { ChildProcess, spawn, fork } from 'child_process';
import args from './init/args';
import { app } from 'electron';
import { createMainWindow, processEvents } from './renderer';

interface HLAEChild {
	process: ChildProcess | null;
}

export const AFXInterop: HLAEChild = {
	process: null
};

export const isDev = process.env.DEV === 'true';

function mainProcess(server: Server) {
	const RMTPServer = fork(require.resolve('./RMTPServer.js'));

	const closeManager = () => {
		if (server) {
			server.emit('send-data-before-closing');
			setTimeout(finallyCloseManager, 10000);
		}
		if (AFXInterop.process) {
			AFXInterop.process.kill();
		}
		if (RMTPServer) {
			RMTPServer.kill();
		}
		// app.quit();
	};
	server.once('close-services', closeManager);

	const finallyCloseManager = () => {
		if (server) {
			server.close();
		}
		app.quit();
	};

	server.on('sent-data-now-close', () => {
		finallyCloseManager();
	});

	app.on('second-instance', () => {
		processEvents.emit('refocus');
	});
}

async function startManagerQuickly() {
	app.setAppUserModelId('com.lexogrine.hudmanager');
	directories.checkDirectories();
	const [server] = await Promise.all([init(), directories.loadAllPremiumHUDs()]);
	//await directories.loadAllPremiumHUDs();
	//const server = await init();
	const argv = args(process.argv);
	mainProcess(server);
	if (!argv.noGUI) createMainWindow(server, argv.dev || isDev);
}

const lock = app.requestSingleInstanceLock();
if (!lock) {
	app.quit();
} else {
	app.on('ready', startManagerQuickly);
}
