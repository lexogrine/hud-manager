'use strict';
import { execFile } from 'child_process';
const isWin = process.platform === 'win32';

type CallbackType = (err: Error | null) => void;
// todo: progress feedback

export function unzip(pack: string, dest: string, callback: CallbackType) {
	if (isWin) {
		const _7z = require('win-7zip')['7z'];
		// 确实奇葩
		// eg. 7z x archive.zip -oc:\Doc
		run(_7z, ['x', pack, '-y', '-o' + dest], callback);
	} else {
		run('unzip', ['-o', pack, '-d', dest], callback);
	}
}

// https://nodejs.org/api/child_process.html#child_process_event_error
// Note that the 'exit' event may or may not fire after an error has occurred.
// If you are listening to both the 'exit' and 'error' events,
// it is important to guard against accidentally invoking handler functions multiple times.
export function run(bin: string, args: string[], callback: CallbackType) {

	callback = onceify(callback);

	const prc = execFile(bin, args);
	prc.on('error', function (err) {
		callback(err);
	});
	prc.on('exit', function (code) {
		callback(code ? new Error('Exited with code ' + code) : null);
	});
}

// http://stackoverflow.com/questions/30234908/javascript-v8-optimisation-and-leaking-arguments
// javascript V8 optimisation and “leaking arguments”
// making callback to be invoked only once
export function onceify(callback: CallbackType) {
	let called = false;
	const containerFunction: CallbackType = err => {
		if (called) return;
		called = true;
		callback(err);
	};
	return containerFunction;
}
