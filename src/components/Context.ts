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
	spaceUsed: number;
	game: I.AvailableGames;
}

const defaultContext: IContextData = {
	teams: [],
	tournaments: [],
	players: [],
	spaceUsed: 0,
	reload: () => {},
	matches: [],
	fields: { players: [], teams: [] },
	hash: '',
	game: 'csgo'
};

export const ContextData = React.createContext(defaultContext);
