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

export type VetoType = 'ban' | 'pick' | 'decider';

export interface Veto {
    teamId: string,
    mapName: string,
    side: 'CT' | 'T' | 'NO',
    type: VetoType,
    score?: {
        [key: string]: number
    },
    reverseSide?:boolean,
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

export interface Config {
    port: number,
    steamApiKey: string,
    token: string,
    hlaePath: string,
    afxCEFHudInteropPath: string,
}
export type PanelInputType = 'text' | 'number' | 'team' | 'image' | 'match';

export type PanelInput = {
    type: PanelInputType,
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
    url: string,
    boltobserv?: {
        css?: boolean;
        maps?: boolean;
    };
    isDev: boolean
}
export interface User {
    id: number,
    email: string ,
    password: string,
    admin: boolean,
    banned: boolean,
}

export type LicenseType = 'free' | 'professional' | 'enterprise';
export interface License {
    id: number,
    type: LicenseType,
    validUntil: Date,
    owner: number,
}

export interface Customer {
    user: User,
    license: License,
    iat: number,
    exp: number
}
export interface CustomerData {
    customer: Customer | null
}
