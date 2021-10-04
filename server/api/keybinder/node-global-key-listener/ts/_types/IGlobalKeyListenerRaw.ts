import { IGlobalKeyEvent } from './IGlobalKeyEvent';

/**
 * The signature of a global key listener
 * return true to halt propagation to other apps on the operating system
 */
export type IGlobalKeyListenerRaw = (event: IGlobalKeyEvent) => boolean;
