import React from 'react';

import * as I from './../api/interfaces';

export interface IContextData {
    teams: I.Team[],
    players: I.Player[],
    reload: Function
}

const defaultContext: IContextData = {teams:[], players:[], reload: ()=>{}}

export const ContextData = React.createContext(defaultContext);