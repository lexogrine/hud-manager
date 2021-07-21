import de_mirage from './de_mirage';
import de_cache from './de_cache';
import de_dust2 from './de_dust2';
import de_inferno from './de_inferno';
import de_train from './de_train';
import de_overpass from './de_overpass';
import de_nuke from './de_nuke';
import de_vertigo from './de_vertigo';
import de_ancient from './de_ancient';

export interface ScaleConfig {
	origin: {
		x: number;
		y: number;
	};
	pxPerUX: number;
	pxPerUY: number;
}

interface SingleLayer {
	config: ScaleConfig;
	file: string;
}

interface DoubleLayer {
	configs: {
		id: string;
		config: ScaleConfig;
		isVisible: (height: number) => boolean;
	}[];
	file: string;
}

export type MapConfig = SingleLayer | DoubleLayer;

const maps: { [key: string]: MapConfig } = {
	de_mirage,
	de_cache,
	de_inferno,
	de_dust2,
	de_train,
	de_overpass,
	de_nuke,
	de_vertigo,
	de_ancient
};

export { maps };
