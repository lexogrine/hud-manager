import { IGlobalKey } from './IGlobalKey';

export type IGlobalKeyDownMap = {
	[K in IGlobalKey]?: boolean;
};
