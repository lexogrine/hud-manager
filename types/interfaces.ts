export interface Player {
    _id?: string,
    firstName: string,
    lastName: string,
    username: string,
    avatar: string,
    country: string,
    steamid: string
}

export interface Team {
    _id?: string,
    name: string,
    shortName: string,
    country: string,
    logo: string
};

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
    vetos: {
        teamId: string,
        mapName: string,
        side: 'CT' | 'T' | 'NO',
        type: 'ban' | 'pick',
        reversed?:boolean,
        score?: {
            [key: string]: number
        },
        reverseSide?:boolean,
        winner?: string,
        mapEnd: boolean
    }[]
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
export type PanelInput = {
    type: 'text' | 'number' | 'select' | 'image'
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
export type KeyBind = {
    bind:string,
    action: string
}

export type PanelTemplate = {
    label: string,
    name: string,
    inputs: PanelInput[]
}

export interface HUD {
    name: string,
    version: string,
    author: string,
    legacy: boolean,
    dir: string,
    radar: boolean,
    killfeed: boolean,
    panel?: PanelTemplate[],
    keybinds?: KeyBind[],
    url: string
}