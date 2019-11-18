export interface Player {
    _id: string,
    firstName: string,
    lastName: string,
    username: string,
    avatar: string,
    country: string,
    steamid: string
};

export interface Team {
    _id: string,
    name: string,
    country: string,
    shortName: string,
    logo: string,
};

export type PanelInputs = {
    type: 'text' | 'number' | 'select'
    name: string,
    label: string,
} | {
    type: 'action'
    name: string,
    label: string,
    values: {
        label: string,
        name: string
    }[]
}

export type PanelTemplate = {
    label: string,
    name: string,
    inputs: PanelInputs[]
}[]

export interface HUD {
    name: string,
    version: string,
    author: string,
    legacy: boolean,
    dir: string,
    panel?: PanelTemplate
}

export interface Config {
    port: number,
    steamApiKey: string,
    token: string,

    /*"PrintPlayerData": false,
    "DisplayAvatars": true,
    "DisplayPlayerAvatars": true,
    "DisplayTeamFlags": false,
    "DisplayPlayerFlags": true,
    "SpecialEvent": "SHOWMATCH",
    "LeftImage": "/files/league/league.png",
    "LeftPrimary": "Primary League Text",
    "LeftSecondary": "Secondary League Text",
    "RightImage": "/files/img/elements/icon_microphone.png",
    "RightPrimary": "Make sure to follow me",
    "RightSecondary": "@KomodoAU on Twitter and Twitch",
    "GSIToken": "120987"*/
}

export interface Veto {
    teamId: string,
    mapName: string,
    side: 'CT' | 'T' | 'NO',
    type: 'ban' | 'pick',
    reversed?:boolean,
    score?: {
        [key: string]: number
    },
    winner?: string,
    mapEnd: boolean
}

export interface Match {
    id: string,
    current: boolean,
    left: {
        id: string | null,
        wins: number
    },
    right: {
        id: string | null,
        wins: number
    },
    matchType: 'bo1' | 'bo2' | 'bo3' | 'bo5',
    vetos: Veto[]
}


export interface CFGGSIResponse {
    success: boolean,
    message?: string
}