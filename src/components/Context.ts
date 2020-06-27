import React from 'react';

import * as I from './../api/interfaces';

export interface IContextData {
    teams: I.Team[],
    players: I.Player[],
    matches: I.Match[],
    reload: Function,
    customer?: I.Customer,
}

const defaultContext: IContextData = {teams:[], players:[], reload: ()=>{}, matches: []}

export const ContextData = React.createContext(defaultContext);