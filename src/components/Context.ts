import React from 'react';

import * as I from './../api/interfaces';

export interface IContextData {
	teams: I.Team[];
	players: I.Player[];
	matches: I.Match[];
	tournaments: I.Tournament[];
	reload: Function;
	customer?: I.Customer;
}

const defaultContext: IContextData = { teams: [], tournaments: [], players: [], reload: () => {}, matches: [] };

export const ContextData = React.createContext(defaultContext);
