import React from 'react';

import * as I from './../api/interfaces';

export interface IContextData {
	teams: I.Team[];
	players: I.Player[];
	matches: I.Match[];
	tournaments: I.Tournament[];
	reload: Function;
	customer?: I.Customer;
	hash: string;
}

const defaultContext: IContextData = {
	teams: [],
	tournaments: [],
	players: [],
	reload: () => {},
	matches: [],
	hash: ''
};

export const ContextData = React.createContext(defaultContext);
