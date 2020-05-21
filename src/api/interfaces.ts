import { PanelInput, PanelInputType, KeyBind, PanelTemplate, HUD, Match, Veto, VetoType } from './../../types/interfaces';

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

export type { PanelInput, PanelInputType, KeyBind, PanelTemplate, HUD, Match, Veto, VetoType };
