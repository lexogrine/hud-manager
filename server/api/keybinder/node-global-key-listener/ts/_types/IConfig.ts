import { IMacConfig } from './IMacConfig';
import { IWindowsConfig } from './IWindowsConfig';

/** Key listener configuration */
export type IConfig = {
	/** The windows key server configuration */
	windows?: IWindowsConfig;
	/** The mac key server configuration */
	mac?: IMacConfig;
	/** The delay after which to dispose the listener server in case no listeners are registered. Defaults to 100, use -1 for no delay at all. */
	disposeDelay?: number;
};
