import { Director } from './director';
import { GSI } from '../socket';

const createDirector = () => {
	return new Director(GSI);
};

export { createDirector };
