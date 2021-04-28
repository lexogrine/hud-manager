import { getACOs } from '../../api/aco';
import { MapConfig } from '../../../types/interfaces';

const areas: { areas: MapConfig[] } = { areas: [] };

getACOs().then(acos => {
	areas.areas = acos;
});

export default areas;
