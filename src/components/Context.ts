import React from 'react';

import * as I from './../api/interfaces';

interface IContextData {
    teams: I.Team[],
    players: I.Player[],
}

const defaultContext: IContextData = {teams:[], players:[]}

export const ContextData = React.createContext(defaultContext);