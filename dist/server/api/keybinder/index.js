"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unregisterAllKeybinds = exports.unregisterKeybind = exports.registerKeybind = void 0;
const electron_1 = require("electron");
const registeredKeybinds = new Map();
const handleKeybind = (accelerator) => () => {
    const keybinds = registeredKeybinds.get(accelerator) || [];
    keybinds.forEach(keybind => keybind.callback());
};
const registerKeybind = (accelerator, callback, owner) => {
    const isRegistered = electron_1.globalShortcut.isRegistered(accelerator);
    if (!isRegistered) {
        const didRegister = electron_1.globalShortcut.register(accelerator, handleKeybind(accelerator));
        if (!didRegister) {
            return false;
        }
    }
    const currentCallbacks = [...(registeredKeybinds.get(accelerator) || [])];
    currentCallbacks.push({ callback, owner });
    registeredKeybinds.set(accelerator, currentCallbacks);
    return true;
};
exports.registerKeybind = registerKeybind;
const unregisterKeybind = (accelerator, owner) => {
    const currentCallbacks = [...(registeredKeybinds.get(accelerator) || [])];
    registeredKeybinds.set(accelerator, currentCallbacks.filter(keybind => !(keybind.owner === owner || !owner)));
};
exports.unregisterKeybind = unregisterKeybind;
const unregisterAllKeybinds = (owner) => {
    const entries = registeredKeybinds.entries();
    for (const entry of entries) {
        registeredKeybinds.set(entry[0], entry[1].filter(keybind => keybind.owner !== owner || !owner));
    }
};
exports.unregisterAllKeybinds = unregisterAllKeybinds;
