"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unregisterAllKeybinds = exports.unregisterKeybind = exports.registerKeybind = void 0;
const node_global_key_listener_1 = require("node-global-key-listener");
const listener = new node_global_key_listener_1.GlobalKeyboardListener();
const keybinds = [];
const parseKeybindInput = (keybindInput) => {
    const keybind = typeof keybindInput === "string" ? keybindInput.split("+") : keybindInput;
    return keybind.map(key => key.toUpperCase());
};
const areKeybindsEqual = (keybindInput, toCompare) => {
    const keybind = parseKeybindInput(keybindInput);
    return keybind.every(bind => toCompare.includes(bind)) && toCompare.every(bind => keybind.includes(bind));
};
const handleKeybind = (keybindEntry, pressed) => {
    const isPressed = areKeybindsEqual(pressed, keybindEntry.keybind); //pressed.every(key => keybindEntry.keybind.includes(key)) && keybindEntry.keybind.every(key => pressed.includes(key));
    const callCallbacks = isPressed && !keybindEntry.active;
    keybindEntry.active = isPressed;
    if (callCallbacks) {
        keybindEntry.callbacks.forEach(callback => {
            callback.callback();
        });
    }
};
listener.addListener((e, down) => {
    if (e.state === "UP") {
        keybinds.forEach(keybind => {
            keybind.active = false;
        });
        return;
    }
    const pressed = Object.keys(down).filter(key => down[key]);
    for (const keybind of keybinds) {
        handleKeybind(keybind, pressed);
    }
});
const registerKeybind = (keybindInput, callback, owner) => {
    const keybind = parseKeybindInput(keybindInput);
    let currentEntry = keybinds.find(keybindEntry => areKeybindsEqual(keybind, keybindEntry.keybind)); //keybinds.find(keybindEntry => keybindEntry.keybind.every(key => keybind.includes(key) && keybind.every(key => keybindEntry.keybind.includes(key))));
    if (!currentEntry) {
        currentEntry = {
            keybind,
            active: false,
            callbacks: []
        };
        keybinds.push(currentEntry);
    }
    currentEntry.callbacks.push({ callback, owner });
};
exports.registerKeybind = registerKeybind;
const unregisterKeybind = (keybindInput, owner) => {
    const keybind = parseKeybindInput(keybindInput);
    const currentEntries = [...(keybinds.filter(keybindEntry => areKeybindsEqual(keybindEntry.keybind, keybind)) || [])];
    currentEntries.forEach(keybindEntry => {
        keybindEntry.callbacks = keybindEntry.callbacks.filter(callback => !(callback.owner === owner || !owner));
    });
};
exports.unregisterKeybind = unregisterKeybind;
const unregisterAllKeybinds = (owner) => {
    keybinds.forEach(keybindEntry => {
        keybindEntry.callbacks = keybindEntry.callbacks.filter(callbacks => callbacks.owner !== owner || !owner);
    });
};
exports.unregisterAllKeybinds = unregisterAllKeybinds;
/*
const handleKeybind = (accelerator: string) => () => {
    const keybinds = registeredKeybinds.get(accelerator) || [];
    keybinds.forEach(keybind => keybind.callback());
};

/*
export const registerKeybind = (accelerator: string, callback: () => void, owner?: string) => {
    const isRegistered = globalShortcut.isRegistered(accelerator);

    if (!isRegistered) {
        const didRegister = globalShortcut.register(accelerator, handleKeybind(accelerator));

        if (!didRegister) {
            return false;
        }
    }

    const currentCallbacks = [...(registeredKeybinds.get(accelerator) || [])];

    currentCallbacks.push({ callback, owner });

    registeredKeybinds.set(accelerator, currentCallbacks);

    return true;
};

export const unregisterKeybind = (accelerator: string, owner?: string) => {
    const currentCallbacks = [...(registeredKeybinds.get(accelerator) || [])];

    registeredKeybinds.set(
        accelerator,
        currentCallbacks.filter(keybind => !(keybind.owner === owner || !owner))
    );
};

export const unregisterAllKeybinds = (owner: string) => {
    const entries = registeredKeybinds.entries();

    for (const entry of entries) {
        registeredKeybinds.set(
            entry[0],
            entry[1].filter(keybind => keybind.owner !== owner || !owner)
        );
    }
};
*/ 
