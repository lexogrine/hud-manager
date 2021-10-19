/** Key server configuration that's windows specific */
export type IWindowsConfig = {
	/** A callback that's triggered with additional information from the keyhandler */
	onInfo?: { (data: string): void };
	/** A callback that's triggered with additional information from the keyhandler */
	onError?: { (errorCode: number): void };
};
