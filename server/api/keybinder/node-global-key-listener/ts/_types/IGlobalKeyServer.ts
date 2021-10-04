import { IGlobalKeyListener } from './IGlobalKeyListener';

/**
 * Global key-server interface - all OSes will attempt to implement this server interface in order to
 */
export type IGlobalKeyServer = {
	/**
	 * Start the keyserver.
	 * @protected
	 */
	start(): Promise<void>;

	/**
	 * Stop the keyserver.
	 * @protected
	 */
	stop(): void;
};
