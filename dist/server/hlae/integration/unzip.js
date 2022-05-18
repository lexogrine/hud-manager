'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.onceify = exports.run = exports.unzip = void 0;
const child_process_1 = require("child_process");
const isWin = process.platform === 'win32';
// todo: progress feedback
function unzip(pack, dest, callback) {
    if (isWin) {
        const _7z = require('win-7zip')['7z'];
        // 确实奇葩
        // eg. 7z x archive.zip -oc:\Doc
        run(_7z, ['x', pack, '-y', '-o' + dest], callback);
    }
    else {
        run('unzip', ['-o', pack, '-d', dest], callback);
    }
}
exports.unzip = unzip;
// https://nodejs.org/api/child_process.html#child_process_event_error
// Note that the 'exit' event may or may not fire after an error has occurred.
// If you are listening to both the 'exit' and 'error' events,
// it is important to guard against accidentally invoking handler functions multiple times.
function run(bin, args, callback) {
    callback = onceify(callback);
    const prc = (0, child_process_1.execFile)(bin, args);
    prc.on('error', function (err) {
        callback(err);
    });
    prc.on('exit', function (code) {
        callback(code ? new Error('Exited with code ' + code) : null);
    });
}
exports.run = run;
// http://stackoverflow.com/questions/30234908/javascript-v8-optimisation-and-leaking-arguments
// javascript V8 optimisation and “leaking arguments”
// making callback to be invoked only once
function onceify(callback) {
    let called = false;
    const containerFunction = err => {
        if (called)
            return;
        called = true;
        callback(err);
    };
    return containerFunction;
}
exports.onceify = onceify;
