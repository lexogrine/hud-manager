import os from 'os';
import { WinKeyServer } from './ts/WinKeyServer';
import { IConfig } from './ts/_types/IConfig';
import { IGlobalKeyDownMap } from './ts/_types/IGlobalKeyDownMap';
import { IGlobalKeyListener } from './ts/_types/IGlobalKeyListener';
import { IGlobalKeyListenerRaw } from './ts/_types/IGlobalKeyListenerRaw';
import { IGlobalKeyServer } from './ts/_types/IGlobalKeyServer';

export * from './ts/_types/IGlobalKeyListener';
export * from './ts/_types/IGlobalKeyEvent';
export * from './ts/_types/IGlobalKey';
export * from './ts/_types/IGlobalKeyDownMap';
export * from './ts/_types/IWindowsConfig';
export * from './ts/_types/IConfig';

/**
 * A cross-platform global keyboard listener. Ideal for setting up global keyboard shortcuts
 * and key-loggers (usually for automation).
 * This keyserver uses low-level hooks on Windows OS and Event Taps on Mac OS, which allows
 * event propagation to be halted to the rest of the operating system as well as allowing
 * any key to be used for shortcuts.
 */
export class GlobalKeyboardListener {
	/** The underlying keyServer used to listen and halt propagation of events */
	protected keyServer: IGlobalKeyServer;
	protected listeners: Array<IGlobalKeyListener>;
	protected config: IConfig;

	/** Whether the server is currently running */
	protected isRunning = false;
	protected stopTimeoutID = 0;

	/** The underlying map of keys that are being held down */
	private readonly isDown: IGlobalKeyDownMap;

	/**
	 * Creates a new keyboard listener
	 * @param config The optional configuration for the key listener
	 */
	public constructor(config: IConfig = {}) {
		this.listeners = [];
		this.isDown = {};
		this.config = config;
		switch (os.platform()) {
			case 'win32':
				this.keyServer = new WinKeyServer(this.baseListener, config.windows);
				break;
			default:
				throw Error('This OS is not supported');
		}
	}

	/**
	 * Add a global keyboard listener to the global keyboard listener server.
	 * @param listener The listener to add to the global keyboard listener
	 * @throws An exception if the process could not be started
	 */
	public async addListener(listener: IGlobalKeyListener): Promise<void> {
		this.listeners.push(listener);
		if (this.listeners.length == 1) {
			clearTimeout(this.stopTimeoutID);
			await this.start();
		}
	}

	/**
	 * Remove a global keyboard listener from the global keyboard listener server.
	 * @param listener The listener to remove from the global keyboard listener
	 */
	public removeListener(listener: IGlobalKeyListener): void {
		const index = this.listeners.indexOf(listener);
		if (index != -1) {
			this.listeners.splice(index, 1);
			if (this.listeners.length == 0) {
				if (this.config.disposeDelay == -1) this.stop();
				else this.stopTimeoutID = setTimeout(() => this.stop(), this.config.disposeDelay ?? 100) as any;
			}
		}
	}

	/** Removes all listeners and destroys the key server */
	public kill() {
		this.listeners = [];
		this.stop();
	}

	/** Start the key server */
	protected start(): Promise<void> {
		let promise = Promise.resolve();
		if (!this.isRunning) promise = this.keyServer.start();
		this.isRunning = true;
		return promise;
	}

	/** Stop the key server */
	protected stop(): void {
		if (this.isRunning) this.keyServer.stop();
		this.isRunning = false;
	}

	/** The following listener is used to monitor which keys are being held down */
	private baseListener: IGlobalKeyListenerRaw = event => {
		if (event.name) {
			switch (event.state) {
				case 'DOWN':
					this.isDown[event.name] = true;
					break;
				case 'UP':
					this.isDown[event.name] = false;
					break;
			}
		}

		let stopPropagation = false;
		for (const onKey of this.listeners) {
			//Forward event
			try {
				const res = onKey(event, this.isDown);

				//Handle catch data
				if (res instanceof Object) {
					if (res.stopPropagation) stopPropagation = true;
					if (res.stopImmediatePropagation) break;
				} else if (res) {
					stopPropagation = true;
				}
			} catch (e) {
				console.error(e);
			}
		}

		return stopPropagation;
	};
}
