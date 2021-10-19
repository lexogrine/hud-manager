import { existsSync } from 'fs';
import path from 'path';
import { GlobalKeyboardListener, IGlobalKey } from './node-global-key-listener';

const listener = new GlobalKeyboardListener();
interface RegisteredKeybind {
	callbacks: { owner?: string; callback: () => void }[];
	keybind: string[];
	active: boolean;
}

const keybinds: RegisteredKeybind[] = [];

const parseKeybindInput = (keybindInput: string | string[]) => {
	const keybind = typeof keybindInput === 'string' ? keybindInput.split('+') : keybindInput;

	return keybind.map(key => key.toUpperCase());
};

const areKeybindsEqual = (keybindInput: string | string[], toCompare: string[]) => {
	const keybind = parseKeybindInput(keybindInput);
	return keybind.every(bind => toCompare.includes(bind)) && toCompare.every(bind => keybind.includes(bind));
};

const handleKeybind = (keybindEntry: RegisteredKeybind, pressed: string[]) => {
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
	if (e.state === 'UP') {
		keybinds.forEach(keybind => {
			keybind.active = false;
		});
		return;
	}
	const pressed = Object.keys(down).filter(key => down[key as IGlobalKey]);
	for (const keybind of keybinds) {
		handleKeybind(keybind, pressed);
	}
});

export const registerKeybind = (keybindInput: string | string[], callback: () => void, owner?: string) => {
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

export const unregisterKeybind = (keybindInput: string | string[], owner?: string) => {
	const keybind = parseKeybindInput(keybindInput);

	const currentEntries = [
		...(keybinds.filter(keybindEntry => areKeybindsEqual(keybindEntry.keybind, keybind)) || [])
	];
	currentEntries.forEach(keybindEntry => {
		keybindEntry.callbacks = keybindEntry.callbacks.filter(callback => !(callback.owner === owner || !owner));
	});
};

export const unregisterAllKeybinds = (owner: string) => {
	keybinds.forEach(keybindEntry => {
		keybindEntry.callbacks = keybindEntry.callbacks.filter(callbacks => callbacks.owner !== owner || !owner);
	});
};

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
