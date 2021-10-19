import { IGlobalKey } from './IGlobalKey';

export type IGlobalKeyLookup = {
	[key: number]: { _nameRaw: string; name: string; standardName?: IGlobalKey };
};
