// @ts-nocheck
'use strict';
var spawn = require('child_process').execFile;
var relative = require('path').relative;
var basename = require('path').basename;
var dirname = require('path').dirname;
var slice = Array.prototype.slice;
var isWin = process.platform === 'win32';

// todo: progress feedback

export function unzip(pack, dest, callback) {
	if (isWin) {
		var _7z = require('win-7zip')['7z'];
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
export function run(bin, args, opts, callback?: any) {
	if (!callback) {
		callback = opts;
		opts = null;
	}
	opts = Object.assign({}, opts, {
		stdio: 'ignore'
	});
	callback = onceify(callback);

	var prc = spawn(bin, args, opts);
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
export function onceify(fn) {
	var called = false;
	return function () {
		if (called) return;
		called = true;
		fn.apply(this, slice.call(arguments)); // slice arguments
	};
}
