import { globalShortcut } from 'electron';

interface RegisteredKeybind {
	owner?: string;
	callback: () => void;
}

const registeredKeybinds: Map<string, RegisteredKeybind[]> = new Map();

const handleKeybind = (accelerator: string) => () => {
	const keybinds = registeredKeybinds.get(accelerator) || [];
	keybinds.forEach(keybind => keybind.callback());
};

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
