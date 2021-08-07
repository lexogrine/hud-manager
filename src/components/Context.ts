import React from 'react';
import * as I from './../api/interfaces';

export interface IContextData {
	teams: I.Team[];
	players: I.Player[];
	matches: I.Match[];
	tournaments: I.Tournament[];
	reload: () => void;
	customer?: I.Customer;
	fields: I.CustomFieldStore;
	hash: string;
	game: I.AvailableGames;
}

const defaultContext: IContextData = {
	teams: [],
	tournaments: [],
	players: [],
	reload: () => {},
	matches: [],
	fields: { players: [], teams: [] },
	hash: '',
	game: 'csgo'
};

export const ContextData = React.createContext(defaultContext);
