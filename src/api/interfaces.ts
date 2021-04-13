import { LicenseType } from './../../types/interfaces';

export type {
	PanelInput,
	SelectActionInput,
	GeneralInput,
	PanelInputType,
	KeyBind,
	PanelTemplate,
	HUD,
	Player,
	Match,
	MatchTeam,
	Veto,
	VetoType,
	Tournament,
	Config,
	ExtendedConfig,
	CFG,
	CustomFieldEntry,
	LicenseType,
	CustomFieldStore,
	Team,
	AvailableGames,
	AvailableResources,
	onExtraChangeFunction
} from './../../types/interfaces';

export interface CFGGSIResponse {
	success: boolean;
	accessible: boolean;
	message?: string;
}

export interface User {
	id: number;
	email: string;
	password: string;
	admin: boolean;
	banned: boolean;
}
export interface License {
	id: number;
	type: LicenseType;
	validUntil: Date;
	owner: number;
}

export interface Customer {
	user: User;
	license: License;
	iat: number;
	exp: number;
}
