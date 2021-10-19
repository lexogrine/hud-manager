/** Key server configuration that's Mac specific */
export type IMacConfig = {
	/** A callback that's triggered with additional information from the keyhandler */
	onInfo?: { (data: string): void };
	/** A callback that's triggered with additional information from the keyhandler */
	onError?: { (errorCode: number | null): void };
};
