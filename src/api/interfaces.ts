export type { PanelInput, SelectActionInput, GeneralInput, PanelInputType, KeyBind, PanelTemplate, HUD, Match, Veto, VetoType, Tournament } from './../../types/interfaces';

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

export interface Config {
    port: number,
    steamApiKey: string,
    token: string,
    hlaePath: string,
    afxCEFHudInteropPath: string,
}
export interface CFGGSIResponse {
    success: boolean,
    accessible: boolean,
    message?: string
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
